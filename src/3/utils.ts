import { ThemeId } from "./types";

export const rollDice = (): ThemeId => (Math.floor(Math.random() * 6) + 1) as ThemeId;

export const uid = () => Math.random().toString(36).slice(2, 10);
