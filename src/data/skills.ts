import skillsData from "./skills.json";

export type SkillTier = "core" | "comfortable" | "learning";

export type Skill = { name: string; tier: SkillTier };

export type SkillIcon =
  | "smartphone"
  | "layers"
  | "cloud"
  | "line-chart"
  | "code"
  | "database"
  | "wrench";

export type SkillGroup = {
  id: string;
  title: string;
  icon: SkillIcon;
  blurb: string;
  skills: Skill[];
};

export const skillGroups: SkillGroup[] = skillsData as SkillGroup[];
