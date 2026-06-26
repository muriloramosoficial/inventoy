"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    lng: "pt-BR",
    fallbackLng: "pt-BR",
    defaultNS: "common",
    ns: ["common", "inventory", "dashboard", "movements", "settings", "auth"],

    interpolation: {
      escapeValue: false,
    },

    returnObjects: true,
  });

export default i18n;
