import { FunctionComponent } from "react";

const SearchBox: FunctionComponent<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange,
}) => {
  return (
    <div className="card">
      <label className="label">Search</label>
      <input
        className="input"
        placeholder="Filter tasks…"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
};

export default SearchBox;
