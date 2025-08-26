"use client";

import { useState, useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';
import ToggleSwitch from '@/components/AnalogTodo/ToggleSwitch';
import { createClient as createClientComponentClient } from '@/utils/supabase/client'; // Import Supabase client
import { useI18n } from '@/i18n/I18nProvider';

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const supabase = useMemo(() => createClientComponentClient(), []); // Initialize Supabase client once
  const [user, setUser] = useState<User | null>(null);
  const { t, locale, setLocale } = useI18n();
  const [weekStart, setWeekStart] = useState<'sunday' | 'monday'>('sunday');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Initialize week start preference
    const savedWeek = window.localStorage.getItem('weekStart') as 'sunday' | 'monday' | null;
    if (savedWeek === 'sunday' || savedWeek === 'monday') {
      setWeekStart(savedWeek);
    } else {
      setWeekStart(locale.startsWith('ko') ? 'monday' : 'sunday');
    }

    // Fetch current user info
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setUser(data.user ?? null);
    })();
  }, [supabase, locale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    window.localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleWeekStartChange = (value: 'sunday' | 'monday') => {
    setWeekStart(value);
    window.localStorage.setItem('weekStart', value);
    // Notify components to re-render with new preference
    window.dispatchEvent(new CustomEvent('weekStartChanged', { detail: value }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirect to home page after logout
  };

  const provider = user && typeof user.app_metadata?.provider === 'string' ? user.app_metadata.provider : undefined;

  if (!mounted) return null;

  return (
    <main className={styles.main}>
      <button onClick={() => router.back()} className={styles.backButton}>
        &larr; {t('settings.back')}
      </button>
      <h1 className={styles.title}>{t('settings.title')}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.myInfo')}</h2>
        {user ? (
          <div className={styles.infoGrid}>
            <div className={styles.label}>{t('settings.labels.name')}</div>
            <div className={`${styles.value} ${styles.name}`}>{user.user_metadata?.name || user.user_metadata?.full_name || '—'}</div>

            <div className={styles.label}>{t('settings.labels.email')}</div>
            <div className={styles.value}>{user.email ?? '—'}</div>

            <div className={styles.label}>{t('settings.labels.provider')}</div>
            <div className={styles.muted}>{provider ?? '—'}</div>

            <div className={styles.label}>{t('settings.labels.lastSignIn')}</div>
            <div className={styles.value} title={user.last_sign_in_at ?? undefined}>{formatDateTime(user.last_sign_in_at)}</div>

            <div className={styles.label}>{t('settings.labels.joined')}</div>
            <div className={styles.value} title={user.created_at ?? undefined}>{formatDateTime(user.created_at)}</div>
          </div>
        ) : (
          <p className={styles.muted}>{t('settings.notSignedIn')}</p>
        )}
        <button onClick={handleLogout} className={styles.logoutButton}>
          {t('settings.logout')}
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.darkMode.title')}</h2>
        <ToggleSwitch isOn={theme === 'dark'} onToggle={toggleTheme} label={t('settings.darkMode.label')} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.language.title')}</h2>
        <div>
          <label className={styles.label} htmlFor="language-select" style={{ marginRight: '0.5rem' }}>
            {t('settings.language.title')}
          </label>
          <select
            id="language-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'en' | 'ko')}
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <option value="en">{t('settings.language.en')}</option>
            <option value="ko">{t('settings.language.ko')}</option>
          </select>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.calendar.weekStart.title')}</h2>
        <div>
          <label className={styles.label} htmlFor="week-start-select" style={{ marginRight: '0.5rem' }}>
            {t('settings.calendar.weekStart.title')}
          </label>
          <select
            id="week-start-select"
            value={weekStart}
            onChange={(e) => handleWeekStartChange(e.target.value as 'sunday' | 'monday')}
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <option value="sunday">{t('settings.calendar.weekStart.sunday')}</option>
            <option value="monday">{t('settings.calendar.weekStart.monday')}</option>
          </select>
        </div>
      </section>


      {/*
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Templates</h2>
        <p>Template settings will go here.</p>
      </section>
      */}
    </main>
  );
}