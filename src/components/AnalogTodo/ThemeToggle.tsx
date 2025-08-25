'use client';
import styles from './ThemeToggle.module.css';

type ThemeToggleProps = {
  currentTheme: 'light' | 'dark';
  onToggle: () => void;
};

export default function ThemeToggle({ currentTheme, onToggle }: ThemeToggleProps) {
  return (
    <button onClick={onToggle} className={styles.toggle} aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}>
      {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}