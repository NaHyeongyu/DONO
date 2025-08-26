import { useEffect, useMemo, useState } from 'react';
import styles from './MiniCalendar.module.css';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import { Todo } from '@/types';
import { useI18n } from '@/i18n/I18nProvider';

type MiniCalendarProps = {
  currentDate: Date; // The date currently selected in the main view
  todos: Todo[]; // All todos to check for presence
  onDateSelect: (date: Date) => void;
};

type WeekStart = 'sunday' | 'monday';

// Utility to check if two dates are the same day (ignoring time)
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export default function MiniCalendar({ currentDate, todos, onDateSelect }: MiniCalendarProps) {
  const { locale, t } = useI18n();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [weekStart, setWeekStart] = useState<WeekStart>('sunday');

  // Initialize week start from localStorage or locale
  useEffect(() => {
    try {
      const saved = (localStorage.getItem('weekStart') as WeekStart | null);
      if (saved === 'monday' || saved === 'sunday') {
        setWeekStart(saved);
      } else {
        setWeekStart(locale.startsWith('ko') ? 'monday' : 'sunday');
      }
    } catch {}
  }, [locale]);

  // Listen for settings changes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as WeekStart | undefined;
      if (detail === 'monday' || detail === 'sunday') setWeekStart(detail);
    };
    window.addEventListener('weekStartChanged', handler as EventListener);
    return () => window.removeEventListener('weekStartChanged', handler as EventListener);
  }, []);

  const calendarGrid = useMemo(() => {
    const rawFirst = new Date(displayYear, displayMonth, 1).getDay(); // 0=Sun
    const firstDayOfMonth = weekStart === 'monday' ? (rawFirst + 6) % 7 : rawFirst; // shift so 0 aligns with weekStart
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

    const grid: (number | null)[][] = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week: (number | null)[] = [];
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
  }, [displayMonth, displayYear, weekStart]);

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
    return todos.some(todo => isSameDay(new Date(todo.inserted_at), checkDate));
  };

  const monthYearLabel = useMemo(() => {
    const sample = new Date(displayYear, displayMonth, 1);
    return sample.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  }, [displayMonth, displayYear, locale]);

  const weekDayLabels = useMemo(() => {
    const base = weekStart === 'monday' ? 1 : 0; // 0=Sun,1=Mon
    return Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (base + i) % 7;
      // 2021-08-01 is a Sunday, use it to get labels by offset
      const d = new Date(2021, 7, 1 + dayIdx);
      return d.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [weekStart, locale]);

  const dayAriaLabel = (day: number) => {
    const d = new Date(displayYear, displayMonth, day);
    const formatted = d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    return t('calendar.aria.selectDate', { date: formatted });
  };

  return (
    <div className={styles.miniCalendar}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton} aria-label={t('calendar.aria.prevMonth')}>
          <ChevronLeftIcon />
        </button>
        <div className={styles.monthYear}>
          {monthYearLabel}
        </div>
        <button onClick={handleNextMonth} className={styles.navButton} aria-label={t('calendar.aria.nextMonth')}>
          <ChevronRightIcon />
        </button>
      </div>
      <div className={styles.grid}>
        {weekDayLabels.map((day) => (
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
                aria-label={dayAriaLabel(day)}
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
