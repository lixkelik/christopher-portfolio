import { Linkedin, Mail, MapPin, Phone } from "lucide-react";

export const ContactSection = () => {
  //   const { toast } = useToast();
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   setIsSubmitting(true);

  //   setTimeout(() => {
  //     //   toast({
  //     //     title: "Message Sent!",
  //     //     description: "Thank you for reaching out. I'll get back to you soon.",
  //     //   });

  //     setIsSubmitting(false);
  //   }, 1500);
  // };
  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Get in <span className="text-primary">Touch</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Have a project in mind or need a developer to be part of your team?
          Feel free to reach out! I'm always open to discussing new
          opportunities, collaborations, or just a friendly chat about
          technology and development.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
          <div className="space-y-8 mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-6 justify-center">
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <h4 className="font-medium">Email</h4>
                  <a
                    href="mailto:christopherfelix.atika@gmail.com"
                    className="text-muted-foreground hover:text-primary transition-colors "
                  >
                    christopherfelix.atika@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <h4 className="font-medium">Phone</h4>
                  <a
                    href="tel:+6285155100892"
                    className="text-muted-foreground hover:text-primary transition-colors "
                  >
                    +62 8515-5100-892
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <h4 className="font-medium">Location</h4>
                  <a className="text-muted-foreground hover:text-primary transition-colors ">
                    Jakarta, Indonesia
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <h4 className="font-medium mb-4">Connect With Me</h4>
              <div className="flex space-x-4 justify-center">
                <a
                  href="https://linkedin.com/in/christopher-felix-atika"
                  target="_blank"
                >
                  <Linkedin />
                </a>
              </div>
            </div>
          </div>

          {/* <div className="bg-card p-8 rounded-lg shadow-xs">
            <h3 className="text-2xl font-semibold mb-6">Send a Message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                  placeholder="ex. John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                  placeholder="ex. johndoe@gmail.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Leave your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "cosmic-button w-full flex items-center justify-center gap-2"
                )}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send size={16} />
              </button>
            </form>
          </div> */}
        </div>
      </div>
    </section>
  );
};
