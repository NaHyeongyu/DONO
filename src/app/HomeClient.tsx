"use client";

import { useState, useEffect, useMemo } from "react";
import { Todo } from "@/types";
import Header from "@/components/AnalogTodo/Header";
import NewTodoInput from "@/components/AnalogTodo/NewTodoInput";
import TodoList from "@/components/AnalogTodo/TodoList";
import Footer from "@/components/AnalogTodo/Footer";
import Sidebar from "@/components/AnalogTodo/Sidebar";
import AuthForm from "@/components/AuthForm";
import { createClient as createClientComponentClient } from "@/utils/supabase/client";
import { db } from "@/lib/db";
import { type User } from "@supabase/supabase-js";
import { useI18n } from "@/i18n/I18nProvider";
import { useSearchParams } from "next/navigation";

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export default function HomeClient() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserAndTodos = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const allTodos = await db.todos.toArray();
      setTodos(allTodos);
    };

    fetchUserAndTodos();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const fetchOnAuthChange = async () => {
            const allTodos = await db.todos.toArray();
            setTodos(allTodos);
          };
          fetchOnAuthChange();
        } else {
          setTodos([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const q = searchParams.get("date");
    if (!q) return;
    const [y, m, d] = q.split("-");
    if (!y || !m || !d) return;
    const yy = Number(y);
    const mm = Number(m);
    const dd = Number(d);
    if (Number.isNaN(yy) || Number.isNaN(mm) || Number.isNaN(dd)) return;
    const parsed = new Date(yy, mm - 1, dd);
    if (!isNaN(parsed.getTime())) {
      setCurrentDate(parsed);
    }
  }, [searchParams]);

  const handleAddTodo = async (text: string) => {
    if (!user) {
      console.error("User not logged in. Cannot add todo.");
      return;
    }

    const todays = todos.filter((todo) =>
      isSameDay(new Date(todo.inserted_at), currentDate)
    );
    const maxOrder = todays.reduce((max, t) => Math.max(max, t.order ?? 0), 0);

    const newTodo: Todo = {
      text,
      is_complete: false,
      inserted_at: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ).toISOString(),
      user_id: user.id,
      status: "pending" as const,
      priority: "medium",
      order: maxOrder + 1,
    };

    try {
      const id = await db.todos.add(newTodo);
      setTodos((prev) => [...prev, { ...newTodo, id: id as number }]);
    } catch (error) {
      console.error("Error adding todo to Dexie:", error);
    }
  };

  const handleToggleTodo = async (id: number) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (!todoToUpdate) return;

    try {
      await db.todos.update(id, {
        is_complete: !todoToUpdate.is_complete,
        status: "synced",
      });
      setTodos((prevTodos) => {
        const updatedTodos = prevTodos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                is_complete: !todoToUpdate.is_complete,
                status: "synced" as const,
              }
            : todo
        );
        const sortedTodos = updatedTodos.sort((a, b) => {
          if (a.is_complete && !b.is_complete) return 1;
          if (!a.is_complete && b.is_complete) return -1;
          return 0;
        });
        return sortedTodos;
      });
    } catch (error) {
      console.error("Error toggling todo in Dexie:", error);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, status: "failed" as const } : todo
        )
      );
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await db.todos.delete(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo from Dexie:", error);
    }
  };

  const handleEditTodo = async (id: number, newText: string) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (!todoToUpdate) return;

    try {
      await db.todos.update(id, { text: newText, status: "synced" });
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, text: newText, status: "synced" as const } : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo text in Dexie:", error);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, status: "failed" as const } : todo
        )
      );
    }
  };

  const handleChangePriority = async (
    id: number,
    priority: "low" | "medium" | "high"
  ) => {
    try {
      await db.todos.update(id, { priority, status: "synced" });
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority, status: "synced" } : t))
      );
    } catch (error) {
      console.error("Error updating priority in Dexie:", error);
    }
  };

  const onDragStartItem = (id: number) => {
    setDraggingId(id);
  };

  const onDragOverItem = (_id: number) => {
    void _id;
  };

  const onDropItem = async (targetId: number) => {
    if (draggingId == null || draggingId === targetId) return;

    const dayItems = todos
      .filter((t) => isSameDay(new Date(t.inserted_at), currentDate))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const srcIndex = dayItems.findIndex((t) => t.id === draggingId);
    const dstIndex = dayItems.findIndex((t) => t.id === targetId);
    if (srcIndex === -1 || dstIndex === -1) return;

    const reordered = [...dayItems];
    const [moved] = reordered.splice(srcIndex, 1);
    reordered.splice(dstIndex, 0, moved);

    const updatedPairs = reordered.map((t, idx) => ({ id: t.id!, order: idx }));

    try {
      await Promise.all(
        updatedPairs.map((p) => db.todos.update(p.id, { order: p.order }))
      );
      setTodos((prev) =>
        prev.map((t) => {
          const found = updatedPairs.find((p) => p.id === t.id);
          return found ? { ...t, order: found.order } : t;
        })
      );
    } catch (error) {
      console.error("Error reordering todos in Dexie:", error);
    } finally {
      setDraggingId(null);
    }
  };

  const onDragEndItem = () => setDraggingId(null);

  const handlePreviousDay = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  const filteredTodos = useMemo(() => {
    const items = todos.filter((todo) =>
      isSameDay(new Date(todo.inserted_at), currentDate)
    );
    const rank = (p?: "low" | "medium" | "high") =>
      p === "high" ? 0 : p === "medium" ? 1 : p === "low" ? 2 : 1;
    items.sort((a, b) => {
      if (a.is_complete && !b.is_complete) return 1;
      if (!a.is_complete && b.is_complete) return -1;
      const pr = rank(a.priority) - rank(b.priority);
      if (pr !== 0) return pr;
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      return ao - bo;
    });
    return items;
  }, [todos, currentDate]);

  const headerTitle = t("home.tasks");

  if (!mounted) return null;

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div>
      <Sidebar
        todos={todos}
        currentDate={currentDate}
        onDateSelect={handleDateSelect}
      />
      <main style={{ marginLeft: "280px", padding: "4rem 3rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Header
            currentDate={currentDate}
            onDateChange={handleDateSelect}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
          />
          <section
            style={{
              backgroundColor: "var(--paper)",
              boxShadow: "0 2px 6px var(--paper-shadow)",
              borderRadius: "4px",
              padding: "2rem",
              marginTop: "2rem",
            }}
            aria-labelledby="todo-section-title"
          >
            <h2 id="todo-section-title" className="sr-only">
              {headerTitle}
            </h2>

            <NewTodoInput onAdd={handleAddTodo} />

            <TodoList
              items={filteredTodos}
              onToggle={(id) => {
                void handleToggleTodo(id);
              }}
              onDelete={(id) => {
                void handleDeleteTodo(id);
              }}
              onEdit={(id, newText) => {
                void handleEditTodo(id, newText);
              }}
              onChangePriority={(id, p) => void handleChangePriority(id, p)}
              onDragStart={(id) => onDragStartItem(id)}
              onDragOver={(id) => onDragOverItem(id)}
              onDrop={(id) => void onDropItem(id)}
              onDragEnd={() => onDragEndItem()}
            />
          </section>
          <Footer note={t("home.footerNote")} />
        </div>
      </main>
    </div>
  );
}
