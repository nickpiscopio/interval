import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";

const translations = {
  en,
  es,
  fr,
};

const i18n = new I18n(translations);

// Set default fallback
i18n.enableFallback = true;
i18n.defaultLocale = "en";

// Detect system device language
const deviceLocales = getLocales();
if (deviceLocales && deviceLocales.length > 0) {
  const languageCode = deviceLocales[0].languageCode ?? "en";
  i18n.locale = languageCode;
} else {
  i18n.locale = "en";
}

/**
 * Translate a key with optional dynamic template parameters.
 * Example: t("selectTimer.greeting") or t("timer.roundOf", { current: 1, total: 4 })
 */
export function t(key: string, options?: Record<string, any>): string {
  return i18n.t(key, options);
}

/**
 * Get current active locale code (e.g. 'en', 'es', 'fr')
 */
export function getLocale(): string {
  return i18n.locale;
}

/**
 * Change locale programmatically
 */
export function setLocale(locale: string) {
  i18n.locale = locale;
}

export default i18n;
