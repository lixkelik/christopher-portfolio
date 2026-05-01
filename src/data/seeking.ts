import seekingData from "./seeking.json";

export type SeekingIcon =
  | "bot"
  | "database"
  | "workflow"
  | "network"
  | "sparkles"
  | "server";

export type SeekingItem = {
  icon: SeekingIcon;
  title: string;
  desc: string;
  tags: string[];
};

export const seekingItems: SeekingItem[] = seekingData as SeekingItem[];
