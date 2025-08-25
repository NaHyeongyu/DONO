'use client';

import { useState, useEffect, useMemo } from 'react';
import { Todo } from '@/types';
import Header from '@/components/AnalogTodo/Header';
import NewTodoInput from '@/components/AnalogTodo/NewTodoInput';
import TodoList from '@/components/AnalogTodo/TodoList';
import Footer from '@/components/AnalogTodo/Footer';
import Sidebar from '@/components/AnalogTodo/Sidebar';
import { createClient as createClientComponentClient } from '@/utils/supabase/client'; // Import client-side client

// --- UTILITY FUNCTIONS ---

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

// --- COMPONENT ---

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Supabase client (client-side)
  const supabase = createClientComponentClient(); // Use client-side client

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('inserted_at', { ascending: true });

      if (error) {
        console.error('Error fetching todos:', error);
      } else {
        setTodos(data as Todo[]);
      }
    };
    fetchTodos();
  }, [supabase]);

  // --- Event Handlers ---
  const handleAddTodo = async (text: string) => {
    const { data: { user } } = await supabase.auth.getUser(); // Get user from client-side auth
    if (!user) {
      console.error('User not logged in.');
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .insert({ task: text, is_complete: false, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', error);
    } else if (data) {
      setTodos(prev => [...prev, data as Todo]);
    }
  };

  const handleToggleTodo = async (id: string) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;

    const { data, error } = await supabase
      .from('todos')
      .update({ is_complete: !todoToUpdate.done })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling todo:', error);
    } else if (data) {
      setTodos(prevTodos => {
        const updatedTodos = prevTodos.map(todo =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        );

        const sortedTodos = updatedTodos.sort((a, b) => {
          if (a.done && !b.done) return 1;
          if (!a.done && b.done) return -1;
          return 0;
        });
        return sortedTodos;
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }
  };

  const handlePreviousDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  // --- Derived State & Filtering ---
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => isSameDay(new Date(todo.createdAt), currentDate));
  }, [todos, currentDate]);

  const headerTitle = "Tasks";

  return (
    <div>
      <Sidebar
        todos={todos}
        currentDate={currentDate}
        onDateSelect={handleDateSelect}
      />
      <main style={{ marginLeft: '280px', padding: '4rem 3rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Header
            currentDate={currentDate}
            onDateChange={handleDateSelect}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
          />
          <section
            style={{
              backgroundColor: 'var(--paper)',
              boxShadow: '0 2px 6px var(--paper-shadow)',
              borderRadius: '4px',
              padding: '2rem',
              marginTop: '2rem',
            }}
            aria-labelledby="todo-section-title"
          >
            <h2 id="todo-section-title" className="sr-only">{headerTitle}</h2>
            
            {isSameDay(currentDate, new Date()) && <NewTodoInput onAdd={handleAddTodo} />}
            
            <TodoList items={filteredTodos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
          </section>
          <Footer note="Write it down, get it done." />
        </div>
      </main>
    </div>
  );
}
