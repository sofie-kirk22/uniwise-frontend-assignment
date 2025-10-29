import { useState } from "react";
import { Achievement, Todo } from "../types";
import { uid } from "../utils";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const push = (a: Omit<Achievement, "id" | "date">) =>
    setAchievements(prev => [{ id: uid(), date: new Date().toISOString(), ...a }, ...prev]);

  const hasForRoll = (code: string, rollId?: number | null) =>
    achievements.some(a => a.code === code && a.rollId === rollId);

  const evaluate = (
    todos: Todo[], target: number | null, roll: number | null, rollId: number,
    setMessage: (m: string) => void
  ) => {
    if (target == null || roll == null) return;
    const total = todos.length;
    const done = todos.filter(t => t.done).length;

    if (roll === 1) {
      if (done === 1 && !hasForRoll("not_your_day", rollId)) {
        push({ label: "Not Your Day: Completed exactly 1 task", kind: "failure", code: "not_your_day", rollId });
        setMessage("Tough day—great job finishing one! 🎖️ Come back tomorrow.");
      } else if (done < 1) setMessage("Roll was 1: aim to complete 1 task today.");
      else setMessage("You went beyond the 1-task goal—nice!");
      return;
    }

    if (done >= target && !hasForRoll("hit_target", rollId)) {
      push({ label: `Hit Your Roll: Completed ${target} task${target === 1 ? "" : "s"}`, kind: "success", code: "hit_target", rollId });
      setMessage(`Target: ${target}. Completed: ${done}. Great job!`);
    }

    if (total > 0 && done === total && !hasForRoll("all_done", rollId)) {
      push({ label: `All Done: Cleared all ${total} task${total === 1 ? "" : "s"}`, kind: "success", code: "all_done", rollId });
      setMessage("Everything cleared—awesome! 🧹");
    }

    if (done < (target ?? Infinity) && roll !== 1) {
      setMessage(`Target: ${target}. Completed: ${done}. Keep going!`);
    }
  };

  return { achievements, pushAchievement: push, hasAchForRoll: hasForRoll, evaluateAchievements: evaluate };
}
