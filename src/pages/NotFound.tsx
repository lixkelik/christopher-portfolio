import { ArrowLeft, Home as HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-lg"
      >
        <p className="text-7xl md:text-8xl font-extrabold text-glow text-primary">
          404
        </p>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold">
          This page wandered off
        </h1>
        <p className="mt-3 text-foreground/70">
          The link you followed may be broken, or the page may have been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/" className="cosmic-button inline-flex items-center gap-2">
            <HomeIcon size={16} /> Back home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded-full border border-border hover:bg-card transition inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Go back
          </button>
        </div>
      </motion.div>
    </div>
  );
};
