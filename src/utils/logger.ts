/**
 * Thin console wrapper for development visibility. Persistent, on-device
 * error logging (surfaced in the Diagnostics screen) goes through
 * AppDatabase.logs — see src/storage/repositories/localLogRepository.ts.
 * Nothing here ever transmits data off the device.
 */
export const logger = {
  info(scope: string, message: string): void {
    // eslint-disable-next-line no-console -- info-level dev logging; warn/error are the only allowed console methods elsewhere
    if (__DEV__) console.log(`[${scope}] ${message}`);
  },
  warn(scope: string, message: string): void {
    if (__DEV__) console.warn(`[${scope}] ${message}`);
  },
  error(scope: string, message: string): void {
    if (__DEV__) console.error(`[${scope}] ${message}`);
  },
};
