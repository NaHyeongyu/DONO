import { useState, useRef, KeyboardEvent, ChangeEvent, DragEvent } from 'react';
import StampIcon from '@/components/icons/StampIcon';
import styles from './TodoItem.module.css';
import { useI18n } from '@/i18n/I18nProvider';
import PrioritySelect from './PrioritySelect';

type TodoItemProps = {
  id: number;
  text: string;
  done: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  isLastItem: boolean;
  onEdit: (id: number, newText: string) => void;
  priority?: 'low' | 'medium' | 'high';
  onChangePriority?: (id: number, priority: 'low' | 'medium' | 'high') => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLLIElement>, id: number) => void;
  onDragOver?: (e: DragEvent<HTMLLIElement>, id: number) => void;
  onDrop?: (e: DragEvent<HTMLLIElement>, id: number) => void;
  onDragEnd?: (e: DragEvent<HTMLLIElement>, id: number) => void;
};

export default function TodoItem({ id, text, done, onToggle, onDelete, isLastItem, onEdit, priority = 'medium', onChangePriority, draggable, onDragStart, onDragOver, onDrop, onDragEnd }: TodoItemProps) {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const startEdit = () => {
    setDraft(text);
    setIsEditing(true);
    // Slight delay to ensure input is rendered before focus
    setTimeout(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    }, 0);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(text);
  };

  const saveEdit = () => {
    const next = draft.trim();
    if (next === '') {
      onDelete(id);
      setIsEditing(false);
      return;
    }
    if (next !== text) {
      onEdit(id, next);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // allow newline with Shift+Enter
        return;
      }
      // Enter (and also Cmd/Ctrl+Enter) saves
      e.preventDefault();
      saveEdit();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  return (
    <li
      className={`${styles.item} ${done ? styles.itemDone : ''} ${isLastItem ? styles.lastItem : ''} ${
        isDragging ? styles.dragging : ''
      } ${isDragOver ? styles.dragOver : ''}`}
      draggable={draggable}
      onDragStart={(e) => {
        // Set drag metadata for better UX
        try {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(id));
        } catch {}
        setIsDragging(true);
        onDragStart?.(e, id);
      }}
      onDragOver={(e) => {
        // Allow dropping by preventing default
        e.preventDefault();
        try {
          e.dataTransfer.dropEffect = 'move';
        } catch {}
        setIsDragOver(true);
        onDragOver?.(e, id);
      }}
      onDragLeave={() => {
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        // Prevent browser from handling the drop
        e.preventDefault();
        setIsDragOver(false);
        onDrop?.(e, id);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        setIsDragOver(false);
        onDragEnd?.(e, id);
      }}
      aria-grabbed={draggable ? undefined : undefined}
      role="listitem"
    >
      <label className={styles.label}>
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(id)}
          className={styles.checkbox}
          aria-labelledby={`todo-text-${id}`}
        />
        {!isEditing && <span className={styles.customCheckbox}></span>}
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={draft}
            onChange={handleChange}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            aria-label={t('todoItem.aria.editInput')}
            className={`${styles.text} ${styles.editArea}`}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            rows={1}
          />
        ) : (
          <span
            id={`todo-text-${id}`}
            className={`${styles.text} ${done ? styles.done : ''}`}
            onDoubleClick={startEdit}
          >
            {text}
          </span>
        )}
      </label>
      {!isEditing && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.dragHandle}
            aria-label={t('todoItem.aria.dragHandle', { text })}
            title={t('todoItem.aria.dragHandle', { text })}
          >
            ⋮⋮
          </button>
          <PrioritySelect
            value={priority}
            onChange={(next) => onChangePriority?.(id, next)}
            ariaLabel={t('todoItem.aria.prioritySelect', { text })}
          />
          <button onClick={startEdit} className={styles.deleteButton} aria-label={t('todoItem.aria.editButton', { text })}>
            {t('todoItem.edit')}
          </button>
          <button onClick={() => onDelete(id)} className={styles.deleteButton} aria-label={t('todoItem.aria.deleteButton', { text })}>
            <StampIcon />
          </button>
        </div>
      )}
    </li>
  );
}
