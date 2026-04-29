import { ContactSection } from "../components/ContactSection";
import { ExperienceSection } from "../components/ExperienceSection";
import { EducationSection } from "../components/EducationSection";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { Navbar } from "../components/Navbar";
import { ProjectsSection } from "../components/ProjectsSection";
import { AchievementsSection } from "../components/AchievementsSection";
import { CertificationsSection } from "../components/CertificationsSection";
import { SkillsSection } from "../components/SkillsSection";
import { ToolkitSection } from "../components/ToolkitSection";
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
          <EducationSection />
        </Reveal>
        <Reveal>
          <ProjectsSection />
        </Reveal>
        <Reveal>
          <AchievementsSection />
        </Reveal>
        <Reveal>
          <CertificationsSection />
        </Reveal>
        <Reveal>
          <SkillsSection />
        </Reveal>
        <Reveal>
          <ToolkitSection />
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
