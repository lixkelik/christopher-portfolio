import { ContactSection } from "../components/ContactSection";
import { ExperienceSection } from "../components/ExperienceSection";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { Navbar } from "../components/Navbar";
import { ProjectsSection } from "../components/ProjectsSection";
import { SkillsSection } from "../components/SkillsSection";
import { Background } from "../components/Background";
import { Reveal } from "../components/ui/Reveal";
import { AskMeWidget } from "../components/AskMeWidget";

export const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden text-center">
      <Background />
      <Navbar />

      <main>
        <HeroSection />
        <Reveal>
          <ExperienceSection />
        </Reveal>
        <Reveal>
          <ProjectsSection />
        </Reveal>
        <Reveal>
          <SkillsSection />
        </Reveal>
        <Reveal>
          <ContactSection />
        </Reveal>
      </main>

      <Footer />
      <AskMeWidget />
    </div>
  );
};
