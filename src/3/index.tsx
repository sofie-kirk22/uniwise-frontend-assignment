import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import "./index.scss";

import { Achievement, ThemeId, Todo } from "./types";
import { rollDice, uid } from "./utils";

// Components
import AddTodo from "./components/AddTodo";
import SearchBox from "./components/SearchBox";
import Achievements from "./components/Achievements";
import TodoList from "./components/TodoList";

// SVG icons
import { Volume2, VolumeX } from "lucide-react";

// Audio imports
import barbieSong from "./audio/barbiegirl.mp3";
import metalSong from "./audio/metal_theme.mp3";
import lofiSong from "./audio/lofi_theme.mp3";
import oceanSong from "./audio/ocean_theme.mp3";

const Index: FunctionComponent = () => {
  // Theme dice 
  const [theme, setTheme] = useState<ThemeId>(rollDice());

  // Todos/Search
  const [todos, setTodos] = useState<Todo[]>([]);
  const [query, setQuery] = useState("");

  // Target dice
  const [rollId, setRollId] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [secondRoll, setSecondRoll] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Roll to set today’s target!");
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Sound
  const [soundOn, setSoundOn] = useState(true);
  const userInteractedRef = useRef(false); 

  // Derived lists
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q ? todos.filter((t) => t.text.toLowerCase().includes(q)) : todos;
  }, [todos, query]);

  const pending = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  /* -------------------- AUDIO HELPERS -------------------- */
  const audioMap: Record<number, { src: string; ref: React.MutableRefObject<HTMLAudioElement | null>; volume: number }> = {
    2: { src: barbieSong, ref: useRef<HTMLAudioElement | null>(null), volume: 0.55 },
    3: { src: metalSong, ref: useRef<HTMLAudioElement | null>(null), volume: 0.6 },
    4: { src: lofiSong, ref: useRef<HTMLAudioElement | null>(null), volume: 0.6 },
    5: { src: oceanSong, ref: useRef<HTMLAudioElement | null>(null), volume: 0.7 },
  };

  const stopAllAudio = () => {
    Object.values(audioMap).forEach(({ ref }) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });
  };

  const ensureAudio = (themeId: number): HTMLAudioElement | null => {
    const cfg = audioMap[themeId];
    if (!cfg) return null;

    if (!cfg.ref.current) {
      const el = new Audio(cfg.src);
      el.volume = cfg.volume;
      el.loop = true;
      cfg.ref.current = el;
    }
    return cfg.ref.current;
  };

  const playAudio = async (themeId: number) => {
    if (!soundOn || !userInteractedRef.current) return;
    stopAllAudio();

    const audio = ensureAudio(themeId);
    if (!audio) return;

    try {
      await audio.play();
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }
  };

  const playForTheme = () => {
    if (!soundOn || !userInteractedRef.current) return;
    if ([2, 3, 4, 5].includes(theme)) playAudio(theme);
    else stopAllAudio();
  };

  /* -------------------- ONCE: CAPTURE FIRST USER GESTURE -------------------- */
  useEffect(() => {
    const onFirstGesture = () => {
      userInteractedRef.current = true;
      playForTheme(); // try to start if initial theme has audio
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, []);

  /* -------------------- REACT TO THEME / SOUND CHANGES -------------------- */
  useEffect(() => {
    if (!soundOn) {
      stopAllAudio();
      return;
    }
    playForTheme();
  }, [theme, soundOn]);

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

    // critical failure roll
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

    // reach at least the target
    if (nextTarget != null && totalDone >= nextTarget && !hasAchForRoll("hit_target", rId)) {
      pushAchievement({
        label: `Hit Your Roll: Completed ${nextTarget} task${nextTarget === 1 ? "" : "s"}`,
        kind: "success",
        code: "hit_target",
        rollId: rId,
      });
      setMessage(`Target: ${nextTarget}. Completed: ${totalDone}. Great job!`);
    }

    // complete all tasks
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
          <h1>
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

          <div className="status">
            <span className="chip">Theme: {theme}</span>
            <span className="chip">Target: {secondRoll == null ? "—" : secondRoll}</span>
          </div>

          {/* Sound toggle (Lucide icons) */}
          <button
            className={`sound-toggle ${soundOn ? "on" : "off"}`}
            onClick={() => {
              const newState = !soundOn;
              setSoundOn(newState);
              if (!newState) {
                stopAllAudio();
              } else {
                if (userInteractedRef.current) playForTheme();
              }
            }}
            title={soundOn ? "Sound On" : "Sound Off"}
            aria-label={soundOn ? "Sound On" : "Sound Off"}
          >
            {soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
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
