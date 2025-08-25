'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';
import ToggleSwitch from '@/components/AnalogTodo/ToggleSwitch'; // Import ToggleSwitch

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    window.localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <main className={styles.main}>
      <button onClick={() => router.back()} className={styles.backButton}>
        &larr; Back
      </button>
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>My Info</h2>
        <p>User information will go here.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dark Mode</h2>
        <ToggleSwitch isOn={theme === 'dark'} onToggle={toggleTheme} label="Enable Dark Mode" /> {/* Use ToggleSwitch */}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Templates</h2>
        <p>Template settings will go here.</p>
      </section>
    </main>
  );
}
