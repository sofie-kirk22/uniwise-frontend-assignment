import { FunctionComponent } from "react";
import { Todo } from "../types";

const TodoList: FunctionComponent<{
  items: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  emptyLabel?: string;
}> = ({ items, onToggle, onDelete, emptyLabel = "No items" }) => {
  if (items.length === 0) return <p className="muted">{emptyLabel}</p>;

  return (
    <ul className="list">
      {items.map((t) => (
        <li key={t.id} className={`item ${t.done ? "done" : ""}`}>
          <label className="check">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => onToggle(t.id)}
            />
            <span className="box" />
          </label>
          <span className="text">{t.text}</span>
          <button className="icon trash" onClick={() => onDelete(t.id)} title="Delete">
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
