import { FunctionComponent } from "react";
import { Achievement } from "../types";

const Achievements: FunctionComponent<{ items: Achievement[] }> = ({ items }) => {
  return (
    <div className="card">
      <div className="label">Achievements</div>
      {items.length === 0 ? (
        <p className="muted">No achievements yet—roll and conquer!</p>
      ) : (
        <ul className="achievements">
          {items.map((a) => (
            <li key={a.id} className={`badge ${a.kind}`}>
              <span className="label">{a.label}</span>
              <time className="time">{new Date(a.date).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Achievements;
