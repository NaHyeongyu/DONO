"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Goal } from "@/types";
import NewGoalInput from "./NewGoalInput";
import styles from "./GoalsSection.module.css";
import { useI18n } from "@/i18n/I18nProvider";

type GoalsSectionProps = {
  type: "short" | "long";
  userId: string;
};

export default function GoalsSection({ type, userId }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const rows = await db.goals.where("type").equals(type).toArray();
      const filtered = rows.filter((g) => g.user_id === userId);
      if (active)
        setGoals(
          filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [type, userId]);

  // --- Drag and Drop Reordering ---
  const onDragStartItem = (id: number) => {
    setDraggingId(id);
  };

  const onDragOverItem = (id: number) => {
    setDragOverId(id);
  };

  const onDropItem = async (targetId: number) => {
    if (draggingId == null || draggingId === targetId) return;

    const typeItems = goals
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const srcIndex = typeItems.findIndex((g) => g.id === draggingId);
    const dstIndex = typeItems.findIndex((g) => g.id === targetId);
    if (srcIndex === -1 || dstIndex === -1) return;

    const reordered = [...typeItems];
    const [moved] = reordered.splice(srcIndex, 1);
    reordered.splice(dstIndex, 0, moved);

    const updatedPairs = reordered.map((g, idx) => ({ id: g.id!, order: idx }));

    try {
      await Promise.all(
        updatedPairs.map((p) => db.goals.update(p.id, { order: p.order }))
      );
      setGoals((prev) =>
        prev.map((g) => {
          const found = updatedPairs.find((p) => p.id === g.id);
          return found ? { ...g, order: found.order } : g;
        })
      );
    } catch (error) {
      console.error("Error reordering goals in Dexie:", error);
    } finally {
      setDraggingId(null);
      setDragOverId(null);
    }
  };

  const onDragEndItem = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleAdd = async (title: string) => {
    const maxOrder = goals.reduce((m, g) => Math.max(m, g.order ?? 0), 0);
    const newGoal: Goal = {
      title,
      type,
      created_at: new Date().toISOString(),
      user_id: userId,
      status: "active",
      order: maxOrder + 1,
    };
    const id = await db.goals.add(newGoal);
    setGoals((prev) => [...prev, { ...newGoal, id }]);
  };

  // Toggle completion like Todo checkbox
  const handleToggle = async (goal: Goal) => {
    if (goal.id == null) return;
    const nextStatus = goal.status === "completed" ? "active" : "completed";
    await db.goals.update(goal.id, { status: nextStatus });
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, status: nextStatus } : g)));
  };

  const handleDelete = async (goal: Goal) => {
    if (goal.id == null) return;
    await db.goals.delete(goal.id);
    setGoals((prev) => prev.filter((g) => g.id !== goal.id));
  };

  const handleStartEdit = (goal: Goal) => {
    if (goal.id == null) return;
    setEditingId(goal.id);
    setEditValue(goal.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async () => {
    if (editingId == null) return;
    const title = editValue.trim();
    if (!title) return;
    await db.goals.update(editingId, { title });
    setGoals((prev) => prev.map((g) => (g.id === editingId ? { ...g, title } : g)));
    setEditingId(null);
    setEditValue("");
  };

  const renderItem = (g: Goal) => (
    <li
      key={g.id}
      className={`${styles.item} ${draggingId === g.id ? styles.dragging : ""} ${
        dragOverId === g.id ? styles.dragOver : ""
      }`}
      draggable={editingId !== g.id}
      onDragStart={(e) => {
        try {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(g.id));
        } catch {}
        if (g.id != null) onDragStartItem(g.id);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        try {
          e.dataTransfer.dropEffect = "move";
        } catch {}
        if (g.id != null) onDragOverItem(g.id);
      }}
      onDragLeave={() => setDragOverId(null)}
      onDrop={(e) => {
        e.preventDefault();
        if (g.id != null) void onDropItem(g.id);
      }}
      onDragEnd={() => onDragEndItem()}
      role="listitem"
    >
      <label className={styles.label}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={g.status === "completed"}
          onChange={() => handleToggle(g)}
          aria-labelledby={`goal-text-${g.id}`}
        />
        {editingId !== g.id && <span className={styles.customCheckbox}></span>}
        {editingId === g.id ? (
          <input
            className={styles.editInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") handleCancelEdit();
            }}
            aria-label={t("goals.actions.edit")}
            autoFocus
          />
        ) : (
          <span
            id={`goal-text-${g.id}`}
            className={`${styles.text} ${g.status === "completed" ? styles.textDone : ""}`}
          >
            {g.title}
          </span>
        )}
      </label>
      <div className={styles.actions}>
        {editingId === g.id ? (
          <>
            <button
              className={styles.textButton}
              onClick={handleSaveEdit}
              aria-label={`${t("goals.actions.save")}: ${editValue}`}
            >
              {t("goals.actions.save")}
            </button>
            <button
              className={styles.textButton}
              onClick={handleCancelEdit}
              aria-label={t("goals.actions.cancel")}
            >
              {t("goals.actions.cancel")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.dragHandle}
              aria-label={t("goals.aria.dragHandle", { text: g.title })}
              title={t("goals.aria.dragHandle", { text: g.title })}
            >
              ⋮⋮
            </button>
            <button
              className={styles.accentButton}
              onClick={() => handleStartEdit(g)}
              aria-label={`${t("goals.actions.edit")}: ${g.title}`}
            >
              {t("goals.actions.edit")}
            </button>
            <button
              className={styles.accentButton}
              onClick={() => handleDelete(g)}
              aria-label={`${t("goals.actions.delete")}: ${g.title}`}
            >
              ×
            </button>
          </>
        )}
      </div>
    </li>
  );

  return (
    <div className={styles.container}>
      <NewGoalInput onAdd={handleAdd} />
      {loading ? (
        <div className={styles.muted}>{t("goals.loading")}</div>
      ) : goals.length === 0 ? (
        <div className={styles.muted}>{t("goals.empty")}</div>
      ) : (
        <>
          {goals.filter((g) => g.status !== "completed").length > 0 && (
            <>
              <h4 className={styles.sectionTitle}>{t("goals.sections.active")}</h4>
              <ul className={styles.list}>
                {goals
                  .filter((g) => g.status !== "completed")
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((g) => renderItem(g))}
              </ul>
            </>
          )}
          {goals.filter((g) => g.status === "completed").length > 0 && (
            <>
              <h4 className={styles.sectionTitle}>{t("goals.sections.completed")}</h4>
              <ul className={styles.list}>
                {goals
                  .filter((g) => g.status === "completed")
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((g) => renderItem(g))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
