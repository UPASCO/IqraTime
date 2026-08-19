import React, { useMemo, useState } from "react";
import { View, Text } from "react-native";

import { Screen, Button, EmptyState } from "@/components";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { getSupportConfig } from "@/config/supportConfig";
import {
  getSupportUnavailableReason,
  isSupportAvailable,
  openSupportPaymentPage,
  type SupportUnavailableReason,
} from "@/services/supportPaymentService";

const REASON_KEY: Record<SupportUnavailableReason, string> = {
  disabled: "support.unavailableReasonDisabled",
  missing_url: "support.unavailableReasonMissingUrl",
  invalid_url: "support.unavailableReasonInvalidUrl",
  legal_not_reviewed: "support.unavailableReasonLegal",
  religious_not_reviewed: "support.unavailableReasonReligious",
  platform_not_approved: "support.unavailableReasonPlatform",
};

export default function SupportScreen(): React.JSX.Element {
  const { colors, spacing, typography, fontScaleMultiplier } = useTheme();
  const { t } = useI18n();
  const config = useMemo(() => getSupportConfig(), []);
  const reason = useMemo(() => getSupportUnavailableReason({ config }), [config]);
  const available = isSupportAvailable({ config });
  const [status, setStatus] = useState<"idle" | "thanked" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!available) {
    // In a production build every gate should be satisfied before this
    // screen is even linked to (see Settings/About) — but if it's reached
    // anyway (e.g. a stale link), fail safe with an explanatory state
    // rather than a broken/blank screen. In development this doubles as
    // the "diagnostic explaining missing validations" the spec calls for.
    return (
      <Screen>
        <EmptyState title={t("support.unavailableTitle")} body={reason ? t(REASON_KEY[reason] as Parameters<typeof t>[0]) : undefined} />
        {__DEV__ ? (
          <View style={{ padding: spacing.md, gap: spacing.xxs }}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption }}>
              [dev only] enabled={String(config.enabled)} url_set={String(!!config.paymentUrl)} legal={String(config.legalReviewed)}{" "}
              religious={String(config.religiousReviewed)} ios={String(config.iosApproved)} android={String(config.androidApproved)}
            </Text>
          </View>
        ) : null}
      </Screen>
    );
  }

  const handleContinue = async (): Promise<void> => {
    const result = await openSupportPaymentPage({ config });
    if (result.success) {
      setStatus("thanked");
      setErrorMessage(null);
    } else {
      setStatus("error");
      setErrorMessage(result.error === "no_browser" ? t("support.errorNoBrowser") : t("support.errorOpenFailed"));
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.accent, fontSize: typography.sizes.title * fontScaleMultiplier, fontWeight: typography.weights.bold }}>
          {t("support.title")}
        </Text>
        <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.body * fontScaleMultiplier }}>{t("support.description")}</Text>

        <Text style={{ color: colors.textSecondary, fontWeight: typography.weights.semibold, marginTop: spacing.sm }}>
          {t("support.principlesTitle")}
        </Text>
        <View style={{ gap: spacing.xxs }}>
          {[
            t("support.principleFree"),
            t("support.principleAllAyat"),
            t("support.principleNoAds"),
            t("support.principleNoPaymentData"),
            t("support.principleSecureProvider"),
          ].map((line) => (
            <Text key={line} style={{ color: colors.textSecondary, fontSize: typography.sizes.body * fontScaleMultiplier }}>
              • {line}
            </Text>
          ))}
        </View>

        <Button label={t("support.continueCta")} onPress={handleContinue} />
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, textAlign: "center" }}>
          {t("support.leavingNotice", { provider: config.providerName })}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, textAlign: "center" }}>
          {t("support.paymentMethodsNotice")}
        </Text>

        {status === "thanked" ? (
          <Text style={{ color: colors.success, textAlign: "center" }}>{t("support.thankYouMessage")}</Text>
        ) : null}
        {status === "error" && errorMessage ? <Text style={{ color: colors.danger, textAlign: "center" }}>{errorMessage}</Text> : null}

        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.caption * fontScaleMultiplier, marginTop: spacing.md }}>
          {t("support.privacyNotice")}
        </Text>
      </View>
    </Screen>
  );
}
