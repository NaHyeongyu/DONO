import styles from './ProgressBar.module.css';
import { useI18n } from '@/i18n/I18nProvider';

type ProgressBarProps = {
  percentage: number;
};

export default function ProgressBar({ percentage }: ProgressBarProps) {
  const { t } = useI18n();
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={styles.container} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.labelBelow}>{t('progressBar.labelWithPercent', { percent: percentage.toFixed(1) })}</div>
      <div className={styles.donutChart}>
        <svg className={styles.svg} width="100" height="100" viewBox="0 0 100 100">
          <circle
            className={styles.circleBackground}
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="10"
          />
          <circle
            className={styles.circleFill}
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            /* Removed transform="rotate(-90deg)" */
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.percentageText}
          >
            {percentage.toFixed(0)}% {/* Display as whole number for simplicity */}
          </text>
        </svg>
      </div>
      <div className={styles.labelBelow}>{t('progressBar.label')}</div>
    </div>
  );
}
