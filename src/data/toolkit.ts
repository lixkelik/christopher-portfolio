import toolkitData from "./toolkit.json";

export type ToolItem = {
  name: string;
  icon: string;
  /**
   * Optional direct icon URL — overrides the Simple Icons CDN lookup.
   * Use this for brands Simple Icons doesn't host (AWS, Java, VS Code, etc.).
   */
  iconUrl?: string;
};

export type ToolCategory = {
  id: string;
  label: string;
  items: ToolItem[];
};

type ToolkitData = { categories: ToolCategory[] };

export const toolkit = (toolkitData as ToolkitData).categories;
