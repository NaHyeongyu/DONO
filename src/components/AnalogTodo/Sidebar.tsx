import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import MiniCalendar from "./MiniCalendar";
import ProgressBar from "./ProgressBar";
import { Todo } from "@/types";
import Link from "next/link"; // Import Link
import { useI18n } from "@/i18n/I18nProvider";
import { usePathname, useRouter } from "next/navigation";

type SidebarProps = {
  todos: Todo[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
};

export default function Sidebar({
  todos,
  currentDate,
  onDateSelect,
}: SidebarProps) {
  const { t } = useI18n();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const formatDateParam = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    const qp = formatDateParam(date);
    // Navigate to Home with selected date so the main list shows that day
    if (pathname !== "/") {
      router.push(`/?date=${qp}`);
    } else {
      // Keep URL in sync even on Home
      router.push(`/?date=${qp}`);
    }
  };

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

      const totalMinutesInDay =
        (endOfDay.getTime() - startOfDay.getTime()) / (1000 * 60);
      const elapsedMinutes =
        (now.getTime() - startOfDay.getTime()) / (1000 * 60);

      const percentage = (elapsedMinutes / totalMinutesInDay) * 100;
      setProgressPercentage(Math.min(100, Math.max(0, percentage)));
    };

    calculateProgress();
    const intervalId = setInterval(calculateProgress, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>DONO</span>
      </div>
      <ProgressBar percentage={progressPercentage} />
      <MiniCalendar
        currentDate={currentDate}
        todos={todos}
        onDateSelect={handleDateSelect}
      />
      <nav className={styles.nav} aria-label={t("sidebar.nav.label")}> 
        <Link href="/goals/short-term" className={styles.navLink}>
          {t("sidebar.nav.shortTerm")}
        </Link>
        <Link href="/goals/long-term" className={styles.navLink}>
          {t("sidebar.nav.longTerm")}
        </Link>
      </nav>
      <div className={styles.settingsLinkContainer}>
        {" "}
        {/* New container for settings link */}
        <Link href="/settings" className={styles.settingsLink}>
          {t("sidebar.settings")}
        </Link>
      </div>
    </aside>
  );
}
