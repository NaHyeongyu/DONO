"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient as createClientComponentClient } from "@/utils/supabase/client";
import { db } from "@/lib/db";
import { Todo } from "@/types";
import Sidebar from "@/components/AnalogTodo/Sidebar";
import Header from "@/components/AnalogTodo/Header";
import Footer from "@/components/AnalogTodo/Footer";
import AuthForm from "@/components/AuthForm";
import { useI18n } from "@/i18n/I18nProvider";
import GoalsSection from "@/components/AnalogTodo/GoalsSection";

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function ShortTermGoalsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t } = useI18n();

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
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => setMounted(true), []);

  const todaysTodos = useMemo(
    () => todos.filter((t) => isSameDay(new Date(t.inserted_at), currentDate)),
    [todos, currentDate]
  );

  if (!mounted) return null;
  if (!user) return <AuthForm />;

  return (
    <div>
      <Sidebar
        todos={todos}
        currentDate={currentDate}
        onDateSelect={setCurrentDate}
      />
      <main style={{ marginLeft: "280px", padding: "4rem 3rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Header
            currentDate={currentDate}
            onDateChange={(d) => setCurrentDate(d)}
            onPreviousDay={() => {
              setCurrentDate((prev) => {
                const nd = new Date(prev);
                nd.setDate(prev.getDate() - 1);
                return nd;
              });
            }}
            onNextDay={() => {
              setCurrentDate((prev) => {
                const nd = new Date(prev);
                nd.setDate(prev.getDate() + 1);
                return nd;
              });
            }}
          />
          <section
            style={{
              backgroundColor: "var(--paper)",
              boxShadow: "0 2px 6px var(--paper-shadow)",
              borderRadius: 4,
              padding: "2rem",
              marginTop: "2rem",
            }}
            aria-labelledby="short-term-goals-title"
          >
            <h1 id="short-term-goals-title" style={{ margin: 0 }}>{t("goals.short.title")}</h1>
            <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
              {t("goals.short.desc")}
            </p>
            <div style={{ marginTop: "1rem", color: "var(--muted)", fontSize: 14 }}>
              {t("goals.todayCount", { count: todaysTodos.length })}
            </div>
            <GoalsSection type="short" userId={user!.id} />
          </section>
          <Footer note={t("home.footerNote")} />
        </div>
      </main>
    </div>
  );
}
