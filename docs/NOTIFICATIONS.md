# Notifications

AyahNow has **no server**. Every notification is a **local notification**,
scheduled ahead of time on the device itself, using `expo-notifications`.
This document explains exactly what that means, what it can and cannot
guarantee, and how the code is structured around those limits.

## The sliding queue strategy

Instead of scheduling "repeat every hour forever" (which would force the
same content on every firing, or require the OS to call back into JS —
neither of which is reliable for delivering a *different* āyah each time),
AyahNow maintains a **sliding queue of individually-scheduled, one-shot
notifications**, each with its own pre-selected āyah:

1. `generateSlotTimes()` (`src/notifications/scheduler.ts`) computes the
   next N valid local-time slots from the user's schedule (window, active
   days, frequency or fixed times, quiet-night guard, optional jitter).
2. `planNotifications()` diffs that against what's already scheduled:
   valid future slots are **kept as-is** (no needless re-selection or
   re-scheduling), obsolete ones (already fired, or invalidated by a
   timezone change) are **cancelled**, and only the gap up to the
   platform's pending-notification budget is filled with new slots.
3. For each new slot, `selectAyah()` (`src/services/selectionEngine/`)
   picks one āyah, respecting the anti-repeat window, theme preferences,
   time-of-day weighting, and length constraints.
4. Each slot becomes one `expo-notifications` `scheduleNotificationAsync`
   call with a `{ type: "date", date }` trigger, using the slot's own
   UUID as the OS notification identifier — so a later cancellation is
   exact (`cancelScheduledNotificationAsync(id)`) and idempotent.
5. The queue is **refilled** every time `reschedule()` runs: app
   foreground, a relevant preference change, or the Diagnostics screen's
   "Reschedule now" button. This is why the onboarding and Diagnostics
   screens both tell the user that occasionally opening the app helps keep
   notifications flowing, especially on iOS.

## iOS: the pending-notification ceiling

iOS does not publish an exact, guaranteed maximum number of pending local
notifications per app — but in practice apps have observed an effective
ceiling in the neighborhood of 64. AyahNow does **not** rely on hitting
that exact number: `src/notifications/limits.ts` subtracts a safety margin
(`appConfig.notificationLimits.iosSafetyMargin`, default 6) and schedules
at most that many at once (`getMaxPendingNotifications()`).

Consequences, explained to the user in onboarding and Diagnostics:

- **AyahNow does not promise an unlimited rotation of new āyāt on iOS
  without you reopening the app.** Once the queue is exhausted, no new
  notifications fire until the app runs again (foreground) and refills it.
- We do **not** paper over this by scheduling one notification that
  repeats with the *same* āyah while claiming it's random — that would be
  actively misleading. If the queue runs out, notifications simply pause
  until the next reschedule.
- The scheduling horizon on iOS is capped at 21 days
  (`getSchedulingHorizonDays()`) to keep the "next N slots" computation
  bounded and fast.

## Android: exact alarms, battery optimization, manufacturer restrictions

- Android has no comparable hard ceiling on scheduled notifications, so
  `androidSoftLimit` (200) is a self-imposed sanity bound, not a
  workaround for an OS limit.
- Android 12+ (API 31+) gates precisely-timed one-shot alarms behind the
  `SCHEDULE_EXACT_ALARM` permission (declared in `app.config.ts`). As of
  this writing, Expo's JS APIs do not expose a way to query
  `AlarmManager.canScheduleExactAlarms()` — `isExactAlarmStatusDetectable()`
  in `src/notifications/permissions.ts` returns `false` on purpose, and
  the Diagnostics screen links to system settings instead of claiming a
  status it cannot actually verify.
- Android 13+ (API 33+) requires the runtime `POST_NOTIFICATIONS`
  permission, requested via `expo-notifications`' standard permission
  flow (`requestPermission()` in `permissions.ts`).
- Some manufacturers (notably those with aggressive custom battery
  managers) may delay or drop background work regardless of standard
  Android APIs. AyahNow cannot detect or work around vendor-specific
  battery optimization; the Diagnostics screen's "Recommendations for
  your device" section on Android points the user at the relevant system
  setting instead of promising delivery it cannot guarantee.

## What we explicitly do not promise

- **Second-precise delivery.** The OS decides the exact firing moment;
  jitter of a few seconds to low minutes is normal and expected.
- **Guaranteed delivery if the OS suspends or kills the app.** A scheduled
  local notification itself is OS-owned and fires independently of the
  app process, but the *queue refill* only happens when the app runs.
- **Visible lock-screen previews if the user has disabled them.** AyahNow
  cannot detect (with certainty) or override the OS notification-preview
  setting; onboarding step 4 explains this and links to system settings.
  `permissions.ts`'s `alertStyleEnabled` reflects the OS's own "will show
  an alert" flag, which is the closest available signal, not a guarantee
  that previews render on the lock screen specifically.
- **An unbounded rotation of new content with the app never opened**, on
  either platform — see the sliding-queue explanation above.

## Time zones and DST

All slot-time math in `scheduler.ts` uses JavaScript's *local* `Date`
constructor and accessors — the same "local time" the device's OS itself
resolves via its current system time zone. There is no separate "which
time zone should this fire in" concept to get wrong: if the user changes
time zones, the next `Date` computed from `new Date(year, month, day,
hour, minute)` in JS automatically reflects the new zone. `planNotifications()`
compares the time zone recorded on the most recent scheduled slot
(`NotificationSlot.timeZone`, captured via
`Intl.DateTimeFormat().resolvedOptions().timeZone` at scheduling time)
against the current one; a change triggers a **full requeue** (see
`timeZoneChanged` in `NotificationPlan`) rather than trying to patch
individual slots. The same local-time approach transparently handles DST
transitions — `generateSlotTimes` is tested across both a US
spring-forward and fall-back date (`tests/unit/scheduler.test.ts`) by
pinning `process.env.TZ`.

## Restart, force-quit, reinstall

- **iOS**: locally-scheduled notifications persist across a normal device
  restart; they do not require any app code to run again to fire.
- **Android**: `AlarmManager`-based exact alarms are cleared on device
  reboot unless an app re-registers them via a `BOOT_COMPLETED` broadcast
  receiver. **This native boot-receiver is not implemented in this
  build** — see `docs/KNOWN_LIMITATIONS.md`. The
  `android.permission.RECEIVE_BOOT_COMPLETED` permission is declared in
  `app.config.ts` in preparation for it, but the actual receiver requires
  native Kotlin/Java code via a custom Expo config plugin, which is out of
  scope for this session. Practical mitigation already in place: the
  queue refills automatically the next time the app is foregrounded.
- **Force-quit**: does not cancel already-scheduled OS notifications on
  either platform; it does mean the queue won't refill until the app runs
  again.
- **Reinstall / data wipe**: all local storage (history, favorites, the
  notification-slot table, preferences) is deleted along with the app;
  onboarding runs again on next launch, exactly as a first install would.
- **App update**: SQLite migrations (`src/storage/migrations/`) run on
  next launch; favorites are preserved by design (migrations only ever add
  columns/tables, never drop existing favorite rows). See
  `docs/KNOWN_LIMITATIONS.md` for the current single-migration state.

## Permissions: refused, later revoked, or notifications system-disabled

- A refused permission at onboarding does not block using the rest of the
  app — `preferences.schedule.enabled` simply stays `false` (or is set to
  `false` if the user later revokes system permission) and Home shows a
  `NotificationStatusCard` pointing at Diagnostics.
- Diagnostics always shows the live permission state
  (`getPermissionSnapshot()`) and offers both a re-request button and a
  system-settings deep link (`openSystemNotificationSettings()`), since a
  denied permission on iOS in particular cannot be re-requested
  programmatically — the user must go through system settings.

## Notification content format

```
Title: AyahNow • Surah 94:5
Body:  « With hardship comes ease. »
```

(`notifications.titleTemplate` in each locale catalog; body composed by
`formatNotificationBody()` in `rescheduleService.ts` from the user's
Arabic/translation/order preferences.) The body is **never truncated** to
fit — `selectAyah()`'s length filter excludes ayat too long for
`MAX_NOTIFICATION_AYAH_LENGTH` (220 chars) *before* selection, so a
shorter āyah is chosen instead of cutting a longer one short.

## Notification actions

Three actions are registered on the `ayahnow.ayah` category
(`registerNotificationCategory()` in `notificationService.ts`): Favorite,
Another āyah, Open. **All three open the app to the foreground** rather
than acting silently in the background. This is a deliberate trade-off,
not an oversight: iOS gives background notification handling only a few
seconds of execution time, and Android's background execution is
similarly constrained and subject to battery-optimization policy on top of
that — neither platform can make a background "mark favorite" or
"pick a new āyah" action reliable. Opening the app guarantees the action
actually completes and gives the user visible confirmation.

## Notification sound

No custom sound file ships in this build (`expo-notifications` plugin
config in `app.config.ts` omits the `sound` field, so the OS default
notification sound is used when `soundEnabled` is on). Add a licensed,
short, non-intrusive sound file and reference it there before production
if a custom sound is desired.
