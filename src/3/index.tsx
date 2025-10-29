import { FunctionComponent, useEffect, useMemo, useState } from "react";
import "./index.scss";

import { Achievement, ThemeId, Todo } from "./types";
import { rollDice, uid } from "./utils";

// Hooks
import { useAudio } from "./hooks/useAudio";
import { useAchievements } from "./hooks/useAchievements";

// Components
import Header from "./components/Header";
import AddTodo from "./components/AddTodo";
import SearchBox from "./components/SearchBox";
import Achievements from "./components/Achievements";
import TodoList from "./components/TodoList";

// Audio assets
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

  // Target dice state
  const [rollId, setRollId] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [secondRoll, setSecondRoll] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Roll to set today’s target!");

  // Achievements hook
  const { achievements, evaluateAchievements } = useAchievements();

  // Memoize audio config 
  const audioDefs = useMemo(
    () => ({
      2: { src: barbieSong, volume: 0.55 },
      3: { src: metalSong, volume: 0.6 },
      4: { src: lofiSong, volume: 0.6 },
      5: { src: oceanSong, volume: 0.7 },
    }),
    []
  );

  // Audio hook 
  const { soundOn, setSoundOn, playForTheme, stopAll } = useAudio(audioDefs);

  // Derived lists
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q ? todos.filter((t) => t.text.toLowerCase().includes(q)) : todos;
  }, [todos, query]);

  const pending = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  useEffect(() => {
    if (!soundOn) {
      stopAll();
      return;
    }
    playForTheme(theme);
  }, [theme, soundOn, playForTheme, stopAll]);

  useEffect(() => stopAll, [stopAll]);

  const evaluate = (
    nextTodos: Todo[],
    nextTarget = target,
    nextRoll = secondRoll,
    rId = rollId
  ) => {
    evaluateAchievements(nextTodos, nextTarget, nextRoll, rId, setMessage);
  };

  /* -------------------- HANDLERS -------------------- */
  const handleAdd = (text: string) => {
    if (!text.trim()) return;
    const next = [{ id: uid(), text: text.trim(), done: false }, ...todos];
    setTodos(next);
    evaluate(next);
  };

  const handleToggle = (id: string) => {
    const next = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(next);
    evaluate(next);
  };

  const handleDelete = (id: string) => {
    const next = todos.filter((t) => t.id !== id);
    setTodos(next);
    evaluate(next);
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
    evaluate(todos, d === 1 ? 1 : d, d, newRollId);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (!next) stopAll();
  };

  return (
    <div id="task-3" className={`theme-${theme}`}>
      <Header
        theme={theme}
        secondRoll={secondRoll}
        onRollTheme={rollTheme}
        onRollTarget={rollTarget}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />

      <p className="message">{message}</p>

      <section className="layout">
        <aside className="panel">
          <AddTodo onAdd={handleAdd} />
          <SearchBox value={query} onChange={setQuery} />
          <Achievements items={achievements as Achievement[]} />
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
