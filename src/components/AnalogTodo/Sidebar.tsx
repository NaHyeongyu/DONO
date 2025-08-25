import { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import MiniCalendar from './MiniCalendar';
import ProgressBar from './ProgressBar';
import { Todo } from '@/types';
import Link from 'next/link'; // Import Link

type SidebarProps = {
  todos: Todo[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
};

export default function Sidebar({ todos, currentDate, onDateSelect }: SidebarProps) {
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const totalMinutesInDay = (endOfDay.getTime() - startOfDay.getTime()) / (1000 * 60);
      const elapsedMinutes = (now.getTime() - startOfDay.getTime()) / (1000 * 60);

      const percentage = (elapsedMinutes / totalMinutesInDay) * 100;
      setProgressPercentage(Math.min(100, Math.max(0, percentage)));
    };

    calculateProgress();
    const intervalId = setInterval(calculateProgress, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <aside
      className={styles.sidebar}
    >
      <div className={styles.logo}>
        <span className={styles.logoText}>DONO</span>
      </div>
      <ProgressBar percentage={progressPercentage} />
      <MiniCalendar
        currentDate={currentDate}
        todos={todos}
        onDateSelect={onDateSelect}
      />
      <div className={styles.settingsLinkContainer}> {/* New container for settings link */}
        <Link href="/settings" className={styles.settingsLink}>
          Settings
        </Link>
      </div>
    </aside>
  );
}