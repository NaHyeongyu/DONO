import { useState, useMemo } from 'react';
import styles from './MiniCalendar.module.css';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import { Todo } from '@/types';

type MiniCalendarProps = {
  currentDate: Date; // The date currently selected in the main view
  todos: Todo[]; // All todos to check for presence
  onDateSelect: (date: Date) => void;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Abbreviated for mini calendar

// Utility to check if two dates are the same day (ignoring time)
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export default function MiniCalendar({ currentDate, todos, onDateSelect }: MiniCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

    const grid = [];
    let day = 1;
    for (let i = 0; i < 6; i++) { // Max 6 weeks in a month view
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null); // Empty cells before the first day
        } else if (day > daysInMonth) {
          week.push(null); // Empty cells after the last day
        } else {
          week.push(day);
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break; // Stop if all days are added
    }
    return grid;
  }, [displayMonth, displayYear]);

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(prev => prev - 1);
    } else {
      setDisplayMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(prev => prev + 1);
    } else {
      setDisplayMonth(prev => prev + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(displayYear, displayMonth, day);
    onDateSelect(newDate);
  };

  const hasTasks = (day: number | null) => {
    if (day === null) return false;
    const checkDate = new Date(displayYear, displayMonth, day);
    return todos.some(todo => isSameDay(new Date(todo.createdAt), checkDate));
  };

  return (
    <div className={styles.miniCalendar}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton} aria-label="Previous month">
          <ChevronLeftIcon />
        </button>
        <div className={styles.monthYear}>
          {MONTH_NAMES[displayMonth]} {displayYear}
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
                  isSameDay(currentDate, new Date(displayYear, displayMonth, day)) ? styles.selected : ''
                } ${hasTasks(day) ? styles.hasTasks : ''}`}
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
