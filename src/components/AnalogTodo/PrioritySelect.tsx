import { useEffect, useId, useRef, useState, KeyboardEvent, MouseEvent } from 'react';
import styles from './PrioritySelect.module.css';
import { useI18n } from '@/i18n/I18nProvider';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export type Priority = 'low' | 'medium' | 'high';

type PrioritySelectProps = {
  value: Priority;
  onChange: (next: Priority) => void;
  ariaLabel: string;
  disabled?: boolean;
};

const OPTIONS: Priority[] = ['high', 'medium', 'low'];
const PRI_COLORS: Record<Priority, string> = {
  low: '#16a34a',
  medium: '#ca8a04',
  high: '#dc2626',
};

export default function PrioritySelect({ value, onChange, ariaLabel, disabled }: PrioritySelectProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => OPTIONS.indexOf(value));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const listId = useId();

  useOnClickOutside(rootRef, () => setOpen(false));

  useEffect(() => {
    setActiveIndex(OPTIONS.indexOf(value));
  }, [value]);

  useEffect(() => {
    if (open) {
      // Focus the list for keyboard navigation
      listRef.current?.focus();
    }
  }, [open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
  };
  const closeList = () => setOpen(false);

  const selectAt = (index: number) => {
    const opt = OPTIONS[index] ?? value;
    onChange(opt);
    closeList();
    // Return focus to button
    buttonRef.current?.focus();
  };

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) setOpen(true);
      else {
        // If already open, move selection
        const delta = e.key === 'ArrowUp' ? -1 : 1;
        const next = clampIndex(activeIndex + delta);
        setActiveIndex(next);
      }
    }
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeList();
      buttonRef.current?.focus();
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(OPTIONS.length - 1);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = clampIndex(activeIndex + (e.key === 'ArrowUp' ? -1 : 1));
      setActiveIndex(next);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectAt(activeIndex);
    }
  };

  const onOptionClick = (e: MouseEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    selectAt(index);
  };

  const buttonPriorityClass =
    value === 'high' ? styles.buttonHigh : value === 'medium' ? styles.buttonMedium : styles.buttonLow;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.button} ${buttonPriorityClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onButtonKeyDown}
        disabled={disabled}
      >
        <span className={styles.label}>
          <span className={styles.dot} aria-hidden="true" />
          {t(`priority.${value}`)}
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listId}-opt-${activeIndex}`}
          className={styles.listbox}
          onKeyDown={onListKeyDown}
        >
          {OPTIONS.map((opt, idx) => {
            const selected = opt === value;
            return (
              <li
                key={opt}
                id={`${listId}-opt-${idx}`}
                role="option"
                aria-selected={selected}
                className={`${styles.option} ${idx === activeIndex ? styles.optionActive : ''} ${
                  selected ? styles.optionSelected : ''
                }`}
                onClick={(e) => onOptionClick(e, idx)}
              >
                <span className={styles.optionDot} style={{ background: PRI_COLORS[opt] }} aria-hidden="true" />
                <span>{t(`priority.${opt}`)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <span className={styles.srOnly} aria-live="polite">
        {t('todoItem.aria.prioritySelect', { text: t(`priority.${value}`) })}
      </span>
    </div>
  );
}

function clampIndex(i: number) {
  if (i < 0) return 0;
  if (i > OPTIONS.length - 1) return OPTIONS.length - 1;
  return i;
}
