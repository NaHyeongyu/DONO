import { useState, KeyboardEvent } from 'react';
import styles from './NewTodoInput.module.css';

type NewTodoInputProps = {
  onAdd: (text: string) => void;
};

export default function NewTodoInput({ onAdd }: NewTodoInputProps) {
  const [text, setText] = useState('');
  const isEmpty = text.trim() === '';

  const handleAdd = () => {
    if (!isEmpty) {
      onAdd(text);
      setText('');
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
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your task…"
        className={styles.input}
        aria-label="New todo input"
      />
      <button
        onClick={handleAdd}
        disabled={isEmpty}
        className={styles.addButton}
        aria-label="Add new todo"
      >
        Add
      </button>
    </div>
  );
}
