import { useState } from 'react';
import styles from './Header.module.css';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import DatePicker from './DatePicker';
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

  const dateString = `${currentDate.getDate()} ${currentDate.toLocaleString('en-US', { month: 'short' })} ${currentDate.getFullYear()}`;

  return (
    <header className={styles.header}>
      <div className={styles.dateNavWrapper}>
        <div className={styles.dateContainer}>
          <button onClick={onPreviousDay} className={styles.navButton} aria-label="Previous day">
            <ChevronLeftIcon />
          </button>
          <button onClick={() => setIsPickerOpen(true)} className={styles.date}>
            {dateString}
          </button>
          <button onClick={onNextDay} className={styles.navButton} aria-label="Next day">
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

