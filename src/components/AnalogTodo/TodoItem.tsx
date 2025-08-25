import StampIcon from '@/components/icons/StampIcon';
import styles from './TodoItem.module.css';

type TodoItemProps = {
  id: string;
  text: string;
  done: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isLastItem: boolean;
};

export default function TodoItem({ id, text, done, onToggle, onDelete, isLastItem }: TodoItemProps) {
  return (
    <li className={`${styles.item} ${isLastItem ? styles.lastItem : ''}`}>
      <label className={styles.label}>
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(id)}
          className={styles.checkbox}
          aria-labelledby={`todo-text-${id}`}
        />
        <span className={styles.customCheckbox}></span>
        <span id={`todo-text-${id}`} className={`${styles.text} ${done ? styles.done : ''}`}>
          {text}
        </span>
      </label>
      <button onClick={() => onDelete(id)} className={styles.deleteButton} aria-label={`Delete task: ${text}`}>
        <StampIcon />
      </button>
    </li>
  );
}
