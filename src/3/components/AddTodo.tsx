import { FunctionComponent, useState } from "react";

const AddTodo: FunctionComponent<{ onAdd: (text: string) => void }> = ({ onAdd }) => {
  const [text, setText] = useState("");
  const submit = () => {
    onAdd(text);
    setText("");
  };

  return (
    <div className="card">
      <label className="label">Add a task</label>
      <div className="row">
        <input
          className="input"
          placeholder="e.g., Read 10 pages"
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className="btn" onClick={submit}>Add</button>
      </div>
    </div>
  );
};

export default AddTodo;
