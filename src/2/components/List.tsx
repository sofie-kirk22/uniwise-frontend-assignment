import { FunctionComponent } from "react";
// Components
import Item from "./Item";

/*
 * The ListProps interface defines the types for the components props.
 *
 * If you would like to proceed without defining types do the following:
 * const Input: FunctionComponent<any> = (props) => {
 *                                ^^^
 *
 * and remove the ListProps interface
 */

interface ListProps {
  items: string[];
}

const List: FunctionComponent<ListProps> = ({ items }) => {
  if (items.length === 0) return <p>No results found.</p>;

  return (
    <ul>
      {items.map((name, index) => (
        <Item key={index} text={name} />
      ))}
    </ul>
  );
};

export default List;

