import { FunctionComponent, useMemo, useRef, useState } from "react";
import "./index.scss";

import { Achievement, ThemeId, Todo } from "./types";
import { rollDice, uid } from "./utils";

import AddTodo from "./components/AddTodo";
import SearchBox from "./components/SearchBox";
import Achievements from "./components/Achievements";
import TodoList from "./components/TodoList";

// 🎵 Local audio imports
import barbieSong from "./audio/barbiegirl.mp3";
import metalSong from "./audio/metal_theme.mp3";
import lofiSong from "./audio/lofi_theme.mp3";
import oceanSong from "./audio/ocean_theme.mp3"; // 🌊 Add this file

const Index: FunctionComponent = () => {
  // Theme dice (aesthetic)
  const [theme, setTheme] = useState<ThemeId>(rollDice());

  // Todos/Search
  const [todos, setTodos] = useState<Todo[]>([]);
  const [query, setQuery] = useState("");

  // Game state
  const [rollId, setRollId] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [secondRoll, setSecondRoll] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Roll to set today’s target!");
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Sound Refs
  const [soundOn, setSoundOn] = useState(true);
  const barbieAudioRef = useRef<HTMLAudioElement | null>(null);
  const metalAudioRef = useRef<HTMLAudioElement | null>(null);
  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const oceanAudioRef = useRef<HTMLAudioElement | null>(null); // 🌊

  // Filtered Todos
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q ? todos.filter((t) => t.text.toLowerCase().includes(q)) : todos;
  }, [todos, query]);

  const pending = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  /* -------------------- AUDIO HELPERS -------------------- */
  const ensureBarbie = () => {
    if (!barbieAudioRef.current) {
      const el = new Audio(barbieSong);
      el.volume = 0.55;
      el.loop = true;
      barbieAudioRef.current = el;
    }
    return barbieAudioRef.current!;
  };
  const ensureMetal = () => {
    if (!metalAudioRef.current) {
      const el = new Audio(metalSong);
      el.volume = 0.6;
      el.loop = true;
      metalAudioRef.current = el;
    }
    return metalAudioRef.current!;
  };
  const ensureLofi = () => {
    if (!lofiAudioRef.current) {
      const el = new Audio(lofiSong);
      el.volume = 0.6;
      el.loop = true;
      lofiAudioRef.current = el;
    }
    return lofiAudioRef.current!;
  };
  const ensureOcean = () => {
    if (!oceanAudioRef.current) {
      const el = new Audio(oceanSong);
      el.volume = 0.7;
      el.loop = true;
      oceanAudioRef.current = el;
    }
    return oceanAudioRef.current!;
  };

  const stopAllAudio = () => {
    [barbieAudioRef, metalAudioRef, lofiAudioRef, oceanAudioRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  };

  const playBarbie = async () => {
    if (!soundOn) return;
    stopAllAudio();
    try {
      await ensureBarbie().play();
    } catch {}
  };
  const playMetal = async () => {
    if (!soundOn) return;
    stopAllAudio();
    try {
      await ensureMetal().play();
    } catch {}
  };
  const playLofi = async () => {
    if (!soundOn) return;
    stopAllAudio();
    try {
      await ensureLofi().play();
    } catch {}
  };
  const playOcean = async () => {
    if (!soundOn) return;
    stopAllAudio();
    try {
      await ensureOcean().play();
    } catch {}
  };

  /* -------------------- ACHIEVEMENTS -------------------- */
  const pushAchievement = (
    a: Omit<Achievement, "id" | "date"> & Partial<Pick<Achievement, "code" | "rollId">>
  ) => {
    setAchievements((prev) => [
      { id: uid(), date: new Date().toISOString(), ...a },
      ...prev,
    ]);
  };

  const hasAchForRoll = (code: string, rId: number | null | undefined) =>
    achievements.some((a) => a.code === code && a.rollId === rId);

  const evaluateProgress = (
    nextTodos: Todo[],
    nextTarget = target,
    nextSecondRoll = secondRoll,
    rId = rollId
  ) => {
    if (nextTarget == null || nextSecondRoll == null) return;

    const total = nextTodos.length;
    const totalDone = nextTodos.filter((t) => t.done).length;

    if (nextSecondRoll === 1) {
      if (totalDone === 1 && !hasAchForRoll("not_your_day", rId)) {
        pushAchievement({
          label: "Not Your Day: Completed exactly 1 task",
          kind: "failure",
          code: "not_your_day",
          rollId: rId,
        });
        setMessage("Tough day—great job finishing one! 🎖️ Come back tomorrow.");
      } else if (totalDone < 1) {
        setMessage("Roll was 1: aim to complete 1 task today.");
      } else {
        setMessage("You went beyond the 1-task goal—nice!");
      }
    }

    if (
      nextTarget != null &&
      totalDone >= nextTarget &&
      !hasAchForRoll("hit_target", rId)
    ) {
      pushAchievement({
        label: `Hit Your Roll: Completed ${nextTarget} task${nextTarget === 1 ? "" : "s"}`,
        kind: "success",
        code: "hit_target",
        rollId: rId,
      });
      setMessage(`Target: ${nextTarget}. Completed: ${totalDone}. Great job!`);
    }

    if (total > 0 && totalDone === total && !hasAchForRoll("all_done", rId)) {
      pushAchievement({
        label: `All Done: Cleared all ${total} task${total === 1 ? "" : "s"}`,
        kind: "success",
        code: "all_done",
        rollId: rId,
      });
      setMessage("Everything cleared—awesome! 🧹");
    }

    if (totalDone < (nextTarget ?? Infinity) && nextSecondRoll !== 1) {
      setMessage(`Target: ${nextTarget}. Completed: ${totalDone}. Keep going!`);
    }
  };

  /* -------------------- HANDLERS -------------------- */
  const handleAdd = (text: string) => {
    if (!text.trim()) return;
    const next = [{ id: uid(), text: text.trim(), done: false }, ...todos];
    setTodos(next);
    evaluateProgress(next);
  };

  const handleToggle = (id: string) => {
    const next = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(next);
    evaluateProgress(next);
  };

  const handleDelete = (id: string) => {
    const next = todos.filter((t) => t.id !== id);
    setTodos(next);
    evaluateProgress(next);
  };

  const rollTheme = () => {
    const d = rollDice();
    setTheme(d);

    // 🎵 Switch soundtrack by theme
    if (!soundOn) {
      stopAllAudio();
      return;
    }
    if (d === 2) playBarbie();
    else if (d === 3) playMetal();
    else if (d === 4) playLofi();
    else if (d === 5) playOcean(); // 🌊 Ocean theme
    else stopAllAudio();
  };

  const rollTarget = () => {
    const d = rollDice();
    const newRollId = rollId + 1;
    setRollId(newRollId);
    setSecondRoll(d);

    if (d === 1) {
      setTarget(1);
      setMessage("Rolled 1: today is not your day—complete just 1 task.");
    } else {
      setTarget(d);
      setMessage(`Rolled ${d}: try to complete ${d} tasks today!`);
    }

    evaluateProgress(todos, d === 1 ? 1 : d, d, newRollId);
  };

  return (
    <div id="task-3" className={`theme-${theme}`}>
      <header className="header">
        <div className="brand">
          <h1 style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 700 }}>
            Dice Todo
          </h1>
          <p className="tag">Gamified goals with a roll of the dice</p>
        </div>

        <div className="controls">
          <button className="btn" onClick={rollTheme} title="Roll for style">
            🎲 Roll Aesthetic
          </button>
          <button className="btn primary" onClick={rollTarget} title="Roll today’s target">
            🎯 Roll Target
          </button>

          {/* Sound toggle */}
          <label className="chip" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(e) => {
                const on = e.target.checked;
                setSoundOn(on);
                if (!on) {
                  stopAllAudio();
                } else {
                  if (theme === 2) playBarbie();
                  else if (theme === 3) playMetal();
                  else if (theme === 4) playLofi();
                  else if (theme === 5) playOcean();
                }
              }}
              style={{ marginRight: 6 }}
            />
            Sound {soundOn ? "On" : "Off"}
          </label>

          <div className="status">
            <span className="chip">Theme: {theme}</span>
            <span className="chip">Target: {secondRoll == null ? "—" : secondRoll}</span>
          </div>
        </div>
      </header>

      <p className="message">{message}</p>

      <section className="layout">
        <aside className="panel">
          <AddTodo onAdd={handleAdd} />
          <SearchBox value={query} onChange={setQuery} />
          <Achievements items={achievements} />
        </aside>

        <main className="panel">
          <h2>Pending</h2>
          <TodoList
            items={pending}
            onToggle={handleToggle}
            onDelete={handleDelete}
            emptyLabel="You're all caught up!"
          />

          <h2>Done</h2>
          <TodoList
            items={done}
            onToggle={handleToggle}
            onDelete={handleDelete}
            emptyLabel="Nothing here yet."
          />
        </main>
      </section>
    </div>
  );
};

export default Index;
