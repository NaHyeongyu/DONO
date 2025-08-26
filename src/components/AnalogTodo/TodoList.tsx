import { Todo } from '@/types';
import TodoItem from './TodoItem';
import styles from './TodoList.module.css';
import { useI18n } from '@/i18n/I18nProvider';

type TodoListProps = {
  items: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
  onChangePriority?: (id: number, priority: 'low' | 'medium' | 'high') => void;
  onDragStart?: (id: number) => void;
  onDragOver?: (id: number) => void;
  onDrop?: (id: number) => void;
  onDragEnd?: () => void;
};

export default function TodoList({ items, onToggle, onDelete, onEdit, onChangePriority, onDragStart, onDragOver, onDrop, onDragEnd }: TodoListProps) {
  const { t } = useI18n();
  const active = items.filter((i) => !i.is_complete);
  const completed = items.filter((i) => i.is_complete);

  if (active.length === 0 && completed.length === 0) {
    return <p className={styles.emptyState}>{t('todoList.empty')}</p>;
  }

  return (
    <>
      {active.length > 0 && (
        <>
          <h4 className={styles.sectionTitle}>{t('todoList.sections.active')}</h4>
          <ul className={styles.list}>
            {active.map((item, index) => (
              <TodoItem
                key={item.id as number}
                id={item.id as number}
                text={item.text}
                done={item.is_complete}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                isLastItem={index === active.length - 1}
                priority={item.priority ?? 'medium'}
                onChangePriority={onChangePriority}
                draggable
                onDragStart={(_, id) => onDragStart?.(id)}
                onDragOver={(_, id) => onDragOver?.(id)}
                onDrop={(_, id) => onDrop?.(id)}
                onDragEnd={() => onDragEnd?.()}
              />
            ))}
          </ul>
        </>
      )}
      {completed.length > 0 && (
        <>
          <h4 className={styles.sectionTitle}>{t('todoList.sections.completed')}</h4>
          <ul className={styles.list}>
            {completed.map((item, index) => (
              <TodoItem
                key={item.id as number}
                id={item.id as number}
                text={item.text}
                done={item.is_complete}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                isLastItem={index === completed.length - 1}
                priority={item.priority ?? 'medium'}
                onChangePriority={onChangePriority}
                draggable
                onDragStart={(_, id) => onDragStart?.(id)}
                onDragOver={(_, id) => onDragOver?.(id)}
                onDrop={(_, id) => onDrop?.(id)}
                onDragEnd={() => onDragEnd?.()}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
