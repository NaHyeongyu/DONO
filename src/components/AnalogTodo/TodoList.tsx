import { Todo } from '@/types';
import TodoItem from './TodoItem';
import styles from './TodoList.module.css';

type TodoListProps = {
  items: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, newPriority: Todo['priority']) => void; // New prop
};

export default function TodoList({ items, onToggle, onDelete, onPriorityChange }: TodoListProps) {
  if (items.length === 0) {
    return <p className={styles.emptyState}>No tasks yet. Add one above!</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <TodoItem
          key={item.id}
          id={item.id}
          text={item.text}
          done={item.done}
          onToggle={onToggle}
          onDelete={onDelete}
          isLastItem={index === items.length - 1}
          priority={item.priority}
          onPriorityChange={onPriorityChange} // Pass onPriorityChange prop
        />
      ))}
    </ul>
  );
}
