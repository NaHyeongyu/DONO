"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./locales/en.json";
import ko from "./locales/ko.json";

type Locale = "en" | "ko";

export type I18nContextValue = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (loc: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

type Dictionary = { [key: string]: string | Dictionary };

const dictionaries: Record<Locale, Dictionary> = {
  en: en as unknown as Dictionary,
  ko: ko as unknown as Dictionary,
};

function getByPath(obj: Dictionary, path: string): string | Dictionary | undefined {
  return path
    .split(".")
    .reduce<undefined | string | Dictionary>((acc, part) => {
      const source = acc === undefined ? obj : (acc as Dictionary);
      const next = (source as Dictionary)[part];
      return next as string | Dictionary | undefined;
    }, undefined);
}

function interpolate(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

function detectInitialLocale(): Locale {
  try {
    const saved = window.localStorage.getItem("locale") as Locale | null;
    if (saved === "en" || saved === "ko") return saved;
    const nav = typeof navigator !== "undefined" ? navigator.language : "en";
    return nav.toLowerCase().startsWith("ko") ? "ko" : "en";
  } catch {
    return "en";
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    try {
      window.localStorage.setItem("locale", loc);
      document.documentElement.setAttribute("lang", loc);
      document.documentElement.setAttribute("data-locale", loc);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[locale] ?? dictionaries.en;
      const value = getByPath(dict, key);
      if (typeof value === "string") return interpolate(value, vars);
      return key; // fallback to key
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
