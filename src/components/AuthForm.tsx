"use client";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";
import styles from "./AuthForm.module.css";
import { useI18n } from "@/i18n/I18nProvider";

export default function AuthForm() {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Use current origin to support different ports/environments
  const origin = typeof window !== 'undefined' ? window.location.origin : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>DONO</div>
        <div className={styles.header}>
          <div className={styles.subtitle}>
            {t("auth.subtitle")}
          </div>
        </div>

        <div className={styles.box}>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#c97c5d",
                    brandAccent: "#d99579",
                    inputBackground: "#fffdf8",
                    inputBorder: "#e0d8c3",
                    inputText: "#3b3028",
                    inputPlaceholder: "#9d8b7a",
                    messageText: "#3b3028",
                    anchorTextColor: "#c97c5d",
                  },
                  radii: {
                    inputBorderRadius: "12px",
                    buttonBorderRadius: "12px",
                  },
                },
              },
            }}
            theme="default"
            showLinks={false}
            providers={["google"]}
            onlyThirdPartyProviders
            redirectTo={origin ? `${origin}/auth/callback` : undefined}
          />
        </div>

        <div className={styles.footer}>
          © {new Date().getFullYear()} DONO · {t("auth.footerText")}
        </div>
      </div>
    </div>
  );
}
