import { FunctionComponent } from "react";

/*
 * The ItemProps interface defines the types for the components props.
 *
 * If you would like to proceed without defining types do the following:
 * const Input: FunctionComponent<any> = (props) => {
 *                                ^^^
 *
 * and remove the ItemProps interface
 */


interface ItemProps {
  text: string;
}

const Item: FunctionComponent<ItemProps> = ({ text }) => {
  return <li>{text}</li>;
};

export default Item;


