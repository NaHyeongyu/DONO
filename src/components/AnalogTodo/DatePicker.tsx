import { useState, useMemo, useRef, useEffect } from "react";
import styles from "./DatePicker.module.css";
import ChevronLeftIcon from "@/components/icons/ChevronLeftIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useI18n } from "@/i18n/I18nProvider";

type DatePickerProps = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
};

type WeekStart = "sunday" | "monday";

export default function DatePicker({
  selectedDate,
  onDateSelect,
  onClose,
}: DatePickerProps) {
  const { locale, t } = useI18n();
  const [displayDate, setDisplayDate] = useState(selectedDate);
  const [mounted, setMounted] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [weekStart, setWeekStart] = useState<WeekStart>("sunday");

  useOnClickOutside<HTMLDivElement>(pickerRef, onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize and react to weekStart preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("weekStart") as WeekStart | null;
      if (saved === "monday" || saved === "sunday") {
        setWeekStart(saved);
      } else {
        setWeekStart(locale.startsWith("ko") ? "monday" : "sunday");
      }
    } catch {}
  }, [locale]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as WeekStart | undefined;
      if (detail === "monday" || detail === "sunday") setWeekStart(detail);
    };
    window.addEventListener("weekStartChanged", handler as EventListener);
    return () => window.removeEventListener("weekStartChanged", handler as EventListener);
  }, []);

  const calendarGrid = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const rawFirst = new Date(year, month, 1).getDay(); // 0=Sun
    const firstDayOfMonth = weekStart === "monday" ? (rawFirst + 6) % 7 : rawFirst;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

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
  }, [displayDate, weekStart]);

  const handlePrevMonth = () => {
    setDisplayDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setDisplayDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const dayAriaLabel = (day: number) => {
    const d = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    const formatted = d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    return t('calendar.aria.selectDate', { date: formatted });
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(
      displayDate.getFullYear(),
      displayDate.getMonth(),
      day
    );
    onDateSelect(newDate);
    onClose();
  };

  if (!mounted) return null;

  return (
    <div className={styles.pickerContainer} ref={pickerRef}>
      <div className={styles.header}>
        <button
          onClick={handlePrevMonth}
          className={styles.navButton}
          aria-label={t('calendar.aria.prevMonth')}
        >
          <ChevronLeftIcon />
        </button>
        <div className={styles.monthYear}>
          {displayDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={handleNextMonth}
          className={styles.navButton}
          aria-label={t('calendar.aria.nextMonth')}
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 7 }).map((_, i) => {
          const base = weekStart === 'monday' ? 1 : 0; // 0=Sun
          const dayIdx = (base + i) % 7;
          const d = new Date(2021, 7, 1 + dayIdx); // 2021-08-01 is Sun
          const label = d.toLocaleDateString(locale, { weekday: 'short' });
          return (
            <div key={`${label}-${i}`} className={styles.weekDay}>
              {label}
            </div>
          );
        })}
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
                    : ""
                }`}
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
