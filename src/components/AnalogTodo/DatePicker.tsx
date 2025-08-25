import { useState, useMemo, useRef } from 'react';
import styles from './DatePicker.module.css';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

type DatePickerProps = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePicker({ selectedDate, onDateSelect, onClose }: DatePickerProps) {
  const [displayDate, setDisplayDate] = useState(selectedDate);
  const pickerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(pickerRef, onClose);

  const calendarGrid = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }
    return grid;
  }, [displayDate]);

  const handlePrevMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    onDateSelect(newDate);
    onClose();
  };

  return (
    <div className={styles.pickerContainer} ref={pickerRef}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton} aria-label="Previous month">
          <ChevronLeftIcon />
        </button>
        <div className={styles.monthYear}>
          {MONTH_NAMES[displayDate.getMonth()]} {displayDate.getFullYear()}
        </div>
        <button onClick={handleNextMonth} className={styles.navButton} aria-label="Next month">
          <ChevronRightIcon />
        </button>
      </div>
      <div className={styles.grid}>
        {WEEK_DAYS.map(day => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
        {calendarGrid.flat().map((day, index) => (
          <div key={index} className={styles.dayCell}>
            {day && (
              <button
                onClick={() => handleDayClick(day)}
                className={`${styles.dayButton} ${
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === displayDate.getMonth() &&
                  selectedDate.getFullYear() === displayDate.getFullYear()
                    ? styles.selected
                    : ''
                }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
