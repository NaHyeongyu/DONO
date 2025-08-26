import { useState, KeyboardEvent } from 'react';
import styles from './NewTodoInput.module.css';
import { useI18n } from '@/i18n/I18nProvider';

type NewGoalInputProps = {
  onAdd: (title: string) => void;
};

export default function NewGoalInput({ onAdd }: NewGoalInputProps) {
  const [title, setTitle] = useState('');
  const isEmpty = title.trim() === '';
  const { t } = useI18n();

  const handleAdd = () => {
    if (!isEmpty) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('newGoal.placeholder')}
        className={styles.input}
        aria-label={t('newGoal.aria.input')}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
      <button
        onClick={handleAdd}
        disabled={isEmpty}
        className={styles.addButton}
        aria-label={t('newGoal.aria.addButton')}
      >
        {t('newGoal.add')}
      </button>
    </div>
  );
}
