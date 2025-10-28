import { FunctionComponent } from "react";

/*
 * The InputProps interface defines the types for the components props.
 *
 * If you would like to proceed without defining types do the following:
 * const Input: FunctionComponent<any> = (props) => {
 *                                ^^^
 *
 * and remove the InputProps interface
 */

interface InputProps {
  query: string;
  region: string;
  onQueryChange: (value: string) => void;
  onRegionChange: (value: string) => void;
}

const Input: FunctionComponent<InputProps> = ({
  query,
  region,
  onQueryChange,
  onRegionChange,
}) => {
  return (
    <div className="search-controls">
      <input
        type="text"
        placeholder="Search by university name..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value)}
      >
        <option value="All">All Regions</option>
        <option value="Capital Region">Capital Region</option>
        <option value="Central Denmark">Central Denmark</option>
        <option value="Southern Denmark">Southern Denmark</option>
        <option value="Zealand">Zealand</option>
        <option value="North Denmark">North Denmark</option>
      </select>
    </div>
  );
};

export default Input;




