export type Project = {
  id: number;
  title: string;
  shortDescription: string;
  longDescription?: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
};

export const projects: Project[] = [
  {
    id: 1,
    title: "Aura",
    shortDescription:
      "Aura is an application for the visually blind to find matching outfits based on the purpose they are going to, using custom built AI model.",
    image: "/projects/aura.png",
    tags: ["Flutter", "Tensorflow", "RFID"],
    demoUrl:
      "https://drive.google.com/file/d/1ZWQM6mltKVA3lvphE-JECtQaig2UXqpD/view?usp=sharing",
    githubUrl: "#",
  },
  {
    id: 2,
    title: "Visio",
    shortDescription:
      "Blind children often struggle to grasp object meanings and social interaction. Our app uses gamified learning to promote inclusive education and understanding.",
    image: "/projects/visio.png",
    tags: ["Flutter", "TFLite", "Object Detection"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: 3,
    title: "Tukerin",
    shortDescription:
      "Tukerin helps Indonesian users overcome EV charging challenges by locating nearby battery swap stations and enabling instant battery swaps through the app.",
    image: "/projects/tukerin.png",
    tags: ["Flutter", "GCP", "Map Navigation"],
    demoUrl: "https://ieeexplore.ieee.org/document/10331276",
    githubUrl: "#",
  },
  {
    id: 4,
    title: "Tanivest",
    shortDescription:
      "Indonesia loses vast farmland yearly due to limited capital and low efficiency, reducing profits and pushing entrepreneurs toward more lucrative industries.",
    image: "/projects/tanivest.png",
    tags: ["Flutter", "Firebase"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: 5,
    title: "Infarm",
    shortDescription:
      "Infarm is an e-commerce platform that empowers Indonesian farmers to access fair farm input prices and multiple vendor options amid post-COVID challenges.",
    image: "/projects/infarm.png",
    tags: ["Flutter", "Firebase"],
    demoUrl: "#",
    githubUrl: "#",
  },
];
