export type ThemeId = 1 | 2 | 3 | 4 | 5 | 6;

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export type AchievementKind = "success" | "failure";
export type AchievementCode = "hit_target" | "all_done" | "not_your_day";

export type Achievement = {
  id: string;
  label: string;
  kind: AchievementKind;
  date: string;          // ISO string
  code?: AchievementCode;
  rollId?: number;       // used to de-dupe per roll
};
