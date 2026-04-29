import educationData from "./education.json";

export type Education = {
  school: string;
  shortName: string;
  degree: string;
  major: string;
  startYear: number;
  endYear: number;
  honors?: string;
  gpa?: number;
  gpaScale?: number;
  logo?: string;
  certificate?: { image: string; caption?: string };
  publication?: { title: string; venue: string; url: string };
  highlights?: string[];
};

export const education: Education = educationData as Education;
