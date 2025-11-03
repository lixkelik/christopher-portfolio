import { Briefcase, Cloud, Code } from "lucide-react";

export const AboutMe = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-primary">Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Android Engineer</h3>
            <p className="text-muted-foreground">
              Fresh graduate with 2 years of internship experience as an
              Fullstack engineer and Android Engineer.
            </p>

            <p className="text-muted-foreground">
              During my internship, I have worked on several impactful projects
              on Financing PayLater team at Traveloka. I also developed project
              outside mobile areas such as contributor of AI Agent with Amazon
              Bedrock.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a
                href="https://drive.google.com/uc?export=download&id=18oyi_-kb_ztKQASrH00ROwzI657wL6hh"
                className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/20 transition-colors duration-300"
              >
                Download CV
              </a>
              <a
                href="https://drive.google.com/uc?export=download&id=1PfZIH7LfdmoMrBI5YUepp75lIH-J70wI"
                className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/20 transition-colors duration-300"
              >
                Download Portfolio
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary " />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Mobile Engineer</h4>
                  <p className="text-muted-foreground">
                    Experienced in native using Kotlin & Java, as well as in
                    cross-platform with React Native.
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Cloud className="h-6 w-6 text-primary " />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Backend</h4>
                  <p className="text-muted-foreground">
                    Not only mobile dev, I also have experience in building
                    backend services with AWS services.
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary " />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Work Experience</h4>
                  <p className="text-muted-foreground">
                    Currently interning as Android Engineer at Traveloka.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
