import { useState } from 'react';
import styles from './Header.module.css';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import DatePicker from './DatePicker';
import { useI18n } from '@/i18n/I18nProvider';
// Removed SearchInput import

type HeaderProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  // Removed searchQuery and onSearchChange props
};

export default function Header({ currentDate, onDateChange, onPreviousDay, onNextDay }: HeaderProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { locale, t } = useI18n();
  const dateString = (() => {
    if (locale.startsWith('ko')) {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth() + 1;
      const d = currentDate.getDate();
      const weekday = currentDate.toLocaleDateString('ko', { weekday: 'short' });
      return `${y}년 ${m}월 ${d}일 (${weekday})`;
    }
    return currentDate.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  })();

  return (
    <header className={styles.header}>
      <div className={styles.dateNavWrapper}>
        <div className={styles.dateContainer}>
          <button onClick={onPreviousDay} className={styles.navButton} aria-label={t('header.aria.prevDay')}>
            <ChevronLeftIcon />
          </button>
          <button onClick={() => setIsPickerOpen(true)} className={styles.date}>
            {dateString}
          </button>
          <button onClick={onNextDay} className={styles.navButton} aria-label={t('header.aria.nextDay')}>
            <ChevronRightIcon />
          </button>
        </div>
        {isPickerOpen && (
          <DatePicker
            selectedDate={currentDate}
            onDateSelect={onDateChange}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </div>
      {/* Removed SearchInput component */}
    </header>
  );
}

