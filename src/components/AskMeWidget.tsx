import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { cn } from "../lib/utils";

const ENDPOINT = import.meta.env.VITE_AI_ENDPOINT as string | undefined;

const SUGGESTIONS = [
  "Give me the 30-second pitch on Christopher.",
  "What's his strongest mobile stack?",
  "Walk me through the Aura project.",
  "What did he ship at Traveloka?",
  "Is he open to new roles right now?",
];

const PROVIDER_LABELS: Record<string, string> = {
  groq: "Llama 3.3",
  cloudflare: "Gemma 4",
  cerebras: "Llama 3.1",
};
const MODEL_CYCLE = Object.values(PROVIDER_LABELS);

const MAX_INPUT_CHARS = 200;
// Anti-spam guards (client-side; the worker enforces hard limits per IP).
const MIN_SEND_INTERVAL_MS = 1500; // wait at least this long between sends
const MAX_USER_MESSAGES_PER_SESSION = 20;

type Msg = { role: "user" | "assistant"; content: string };

const SEEN_KEY = "portfolio.askai.seen";

// Characters per tick for the typing animation. Higher = faster.
const TYPE_CHARS_PER_TICK = 3;
const TYPE_TICK_MS = 16;

// Show the attract tooltip after this delay if user hasn't interacted yet.
const ATTRACT_DELAY_MS = 2500;

// Floating launcher's resting position (matches `bottom-5 right-5`).
const FLOATING_OFFSET_PX = 20;

export const AskMeWidget = () => {
  const [open, setOpen] = useState(false);
  // Start fresh on every page load. Old turns sent back to the LLM on each
  // request would cost tokens for no real benefit on a portfolio chat.
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track which provider last responded (for dynamic model label).
  const [lastProvider, setLastProvider] = useState<string | null>(null);
  // Cycle through model names when no response yet.
  const [cycleIdx, setCycleIdx] = useState(0);
  // Index of the assistant message currently being "typed" in. -1 = none.
  const [typingIndex, setTypingIndex] = useState<number>(-1);
  // Bumped on reset so the empty-state block re-mounts and re-animates.
  const [resetKey, setResetKey] = useState(0);
  // Whether the user has ever opened/hovered the assistant.
  // `seenWobble` persists across refreshes (stops the wobble permanently).
  // `seenTooltip` is in-memory only (tooltip reappears every refresh).
  const [seenWobble, setSeenWobble] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [seenTooltip, setSeenTooltip] = useState(false);
  // Once the user has clicked the hero CTA the floating launcher becomes
  // visible for the rest of the session (in-memory only — a refresh resets
  // back to the hero CTA being shown again).
  const [pinned, setPinned] = useState(false);
  // Whether the hero CTA is currently in viewport. Hide floating while it is.
  // 'unknown' avoids flashing the floating button before the hero reports in.
  const [heroVisible, setHeroVisible] = useState<"unknown" | boolean>(
    "unknown"
  );
  // When the floating launcher mounts after a hero click, animate from this
  // offset (delta from final resting position back to where the hero was).
  const [flyFrom, setFlyFrom] = useState<{ x: number; y: number } | null>(
    null
  );
  // Show the attract tooltip only after a short delay (gives the page time
  // to settle so it doesn't flash during initial paint).
  const [showAttract, setShowAttract] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Timestamp (ms) of the last successful send; used to enforce cooldown.
  const lastSendRef = useRef(0);

  // Hide entirely if the worker URL isn't configured
  if (!ENDPOINT) return null;

  // Cycle through model names every 2.5s when no provider is known yet
  useEffect(() => {
    if (lastProvider) return;
    const timer = setInterval(() => {
      setCycleIdx((i) => (i + 1) % MODEL_CYCLE.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [lastProvider]);

  // Computed model label
  const modelLabel = lastProvider
    ? PROVIDER_LABELS[lastProvider] ?? lastProvider
    : MODEL_CYCLE[cycleIdx];

  // Persist conversation for the session
  // (intentionally not persisted — every refresh starts fresh)

  // Auto-scroll on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Listen for global "open-ask-ai" events (e.g. from the Hero CTA button).
  // If the event carries a `from` rect, capture it so the floating launcher
  // can animate in from there.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ from?: DOMRect }>).detail;
      if (detail?.from && typeof window !== "undefined") {
        const r = detail.from;
        // Floating launcher's final position (bottom-right of viewport).
        // Compute the delta in screen coords so initial transform places the
        // mounted floating button visually where the hero button was.
        const finalRight = window.innerWidth - FLOATING_OFFSET_PX;
        const finalBottom = window.innerHeight - FLOATING_OFFSET_PX;
        // Use the hero rect's right/bottom as the "from" anchor.
        const dx = r.x + r.width - finalRight;
        const dy = r.y + r.height - finalBottom;
        setFlyFrom({ x: dx, y: dy });
      }
      setPinned(true);
      setOpen(true);
      markSeen();
    };
    window.addEventListener("open-ask-ai", onOpen);
    return () => window.removeEventListener("open-ask-ai", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for hero CTA visibility changes.
  useEffect(() => {
    const onVis = (e: Event) => {
      const detail = (e as CustomEvent<{ visible: boolean }>).detail;
      setHeroVisible(!!detail?.visible);
    };
    window.addEventListener("ask-ai-hero-visibility", onVis);
    return () => window.removeEventListener("ask-ai-hero-visibility", onVis);
  }, []);

  // If the hero never reports in within 400ms, assume there's no hero CTA on
  // this page (e.g. 404 page) and reveal the floating launcher.
  useEffect(() => {
    if (heroVisible !== "unknown") return;
    const id = window.setTimeout(() => {
      setHeroVisible((v) => (v === "unknown" ? false : v));
    }, 400);
    return () => window.clearTimeout(id);
  }, [heroVisible]);

  // Trigger attract tooltip after delay, only if the user hasn't dismissed it.
  useEffect(() => {
    if (seenTooltip) return;
    const id = window.setTimeout(() => setShowAttract(true), ATTRACT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [seenTooltip]);

  // Auto-dismiss attract tooltip after a while so it doesn't stay forever.
  useEffect(() => {
    if (!showAttract) return;
    const id = window.setTimeout(() => setShowAttract(false), 12_000);
    return () => window.clearTimeout(id);
  }, [showAttract]);

  const markSeen = () => {
    setSeenTooltip(true);
    setShowAttract(false);
    if (!seenWobble) {
      setSeenWobble(true);
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim().slice(0, MAX_INPUT_CHARS);
    if (!trimmed || pending) return;

    // Throttle: at most one send every MIN_SEND_INTERVAL_MS.
    const now = Date.now();
    const wait = MIN_SEND_INTERVAL_MS - (now - lastSendRef.current);
    if (wait > 0) {
      setError(
        `Slow down a bit — try again in ${Math.ceil(wait / 1000)}s.`
      );
      return;
    }

    // Per-session message cap.
    const userMsgCount = messages.filter((m) => m.role === "user").length;
    if (userMsgCount >= MAX_USER_MESSAGES_PER_SESSION) {
      setError(
        `You've hit this session's message limit (${MAX_USER_MESSAGES_PER_SESSION}). Refresh to start a new chat or email Christopher directly.`
      );
      return;
    }

    setError(null);
    lastSendRef.current = now;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error ?? "Too many requests — please wait a moment."
        );
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply: string =
        data?.choices?.[0]?.message?.content?.trim() ??
        "Hmm, I didn't get a response. Try again?";
      if (data?._provider) setLastProvider(data._provider);
      const updated: Msg[] = [...next, { role: "assistant", content: reply }];
      setMessages(updated);
      setTypingIndex(updated.length - 1);
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong reaching the assistant.";
      setError(msg);
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const reset = () => {
    setMessages([]);
    setError(null);
    setTypingIndex(-1);
    setResetKey((k) => k + 1);
    setLastProvider(null);
  };

  const remaining = MAX_INPUT_CHARS - input.length;

  // Floating launcher visibility:
  //   - Always shown once the user has pinned it (clicked the hero CTA).
  //   - Otherwise shown only when the hero CTA is NOT in viewport.
  const showFloating = pinned || heroVisible === false;

  return (
    <>
      {/* Floating launcher */}
      <AnimatePresence>
        {showFloating && (
          <FloatingLauncher
            key="floating"
            open={open}
            attract={!seenWobble}
            showTooltip={showAttract && !open}
            flyFrom={flyFrom}
            onFlyComplete={() => setFlyFrom(null)}
            onClick={() => {
              setOpen((v) => !v);
              markSeen();
            }}
            onHover={markSeen}
          />
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-5 z-40 w-auto sm:w-[380px] max-h-[78vh] flex flex-col rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="AI assistant chat"
          >
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/40">
              <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
                <Bot size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">
                  Ask about Christopher
                </p>
                <p className="text-[11px] text-foreground/55 overflow-hidden h-4">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={modelLabel}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="block"
                    >
                      {modelLabel}
                    </motion.span>
                  </AnimatePresence>
                </p>
              </div>
              {messages.length > 0 && (
                <motion.button
                  type="button"
                  onClick={reset}
                  whileHover={{ rotate: -180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="p-1.5 rounded-md text-foreground/55 hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Reset conversation"
                  title="Reset conversation"
                >
                  <RotateCcw size={14} />
                </motion.button>
              )}
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
              <AnimatePresence mode="wait">
                {messages.length === 0 && (
                  <motion.div
                    key={`empty-${resetKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 text-left"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-sm text-foreground/85"
                    >
                      Hi! I only answer questions about Christopher's work,
                      projects, and skills — using the data on this site. What
                      would you like to know?
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.2 }}
                      className="text-[11px] uppercase tracking-wider text-foreground/50 mt-2"
                    >
                      Quick prompts
                    </motion.p>
                    <motion.div
                      className="flex flex-col gap-1.5"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            delayChildren: 0.2,
                            staggerChildren: 0.06,
                          },
                        },
                      }}
                    >
                      {SUGGESTIONS.map((s) => (
                        <motion.button
                          key={s}
                          type="button"
                          onClick={() => sendMessage(s)}
                          disabled={pending}
                          variants={{
                            hidden: { opacity: 0, y: 12, scale: 0.92 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: {
                                type: "spring",
                                stiffness: 320,
                                damping: 22,
                              },
                            },
                          }}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.97 }}
                          className="group text-left text-xs px-3 py-2 rounded-lg border border-border bg-background/60 hover:border-primary/40 hover:bg-card transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Sparkles
                            size={12}
                            className="text-primary/70 group-hover:text-primary shrink-0"
                          />
                          <span className="flex-1">{s}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((m, i) => (
                <Bubble
                  key={i}
                  msg={m}
                  animate={i === typingIndex}
                  onScrollTick={() =>
                    scrollRef.current?.scrollTo({
                      top: scrollRef.current.scrollHeight,
                    })
                  }
                  onDone={() => {
                    if (i === typingIndex) setTypingIndex(-1);
                  }}
                />
              ))}

              {pending && (
                <div className="flex items-center gap-2 text-xs text-foreground/55 pl-2">
                  <span className="inline-flex gap-1">
                    <Dot delay={0} />
                    <Dot delay={0.15} />
                    <Dot delay={0.3} />
                  </span>
                  thinking…
                </div>
              )}

              {error && (
                <div className="text-xs text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 p-3 border-t border-border bg-background/40"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value.slice(0, MAX_INPUT_CHARS))
                }
                placeholder="Ask anything about Christopher…"
                aria-label="Message"
                maxLength={MAX_INPUT_CHARS}
                disabled={pending}
                className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none placeholder:text-foreground/40"
              />
              <span
                className={cn(
                  "text-[10px] tabular-nums shrink-0",
                  remaining < 50 ? "text-amber-500" : "text-foreground/40"
                )}
                aria-live="polite"
              >
                {remaining}
              </span>
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send"
                className={cn(
                  "p-2 rounded-full transition shrink-0",
                  input.trim() && !pending
                    ? "bg-primary text-primary-foreground hover:shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                    : "bg-card text-foreground/40 cursor-not-allowed"
                )}
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ----------------------------------------------------------------------------
// Floating launcher: animated conic gradient ring + pulsing halo + sparkles
// ----------------------------------------------------------------------------

const FloatingLauncher = ({
  open,
  attract,
  showTooltip,
  flyFrom,
  onFlyComplete,
  onClick,
  onHover,
}: {
  open: boolean;
  attract: boolean;
  showTooltip: boolean;
  flyFrom: { x: number; y: number } | null;
  onFlyComplete: () => void;
  onClick: () => void;
  onHover: () => void;
}) => {
  // Bump animation: only when not opened AND user hasn't interacted yet.
  const isBumping = attract && !open;
  const animateProps = isBumping
    ? {
        opacity: 1,
        scale: 1,
        x: 0,
        y: [0, -8, 0, -4, 0],
        rotate: [0, -6, 6, -3, 0],
      }
    : { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 };

  // Initial transform — if we have a flyFrom offset, start there at full
  // opacity so it visually continues from the hero button. Otherwise use the
  // default pop-in.
  const initialProps = flyFrom
    ? { opacity: 1, scale: 1, x: flyFrom.x, y: flyFrom.y }
    : { opacity: 0, scale: 0.6, y: 30 };

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40 pointer-events-none"
      exit={{ opacity: 0, scale: 0.5, y: 20 }}
      transition={{ duration: 0.25, ease: "easeIn" }}
    >
      <div className="relative pointer-events-auto">
        {/* Attract tooltip — speech bubble pointing at the button */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              key="attract-tooltip"
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap"
            >
              <div className="relative px-3 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-fuchsia-500/30">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Ask me anything!
                </span>
                {/* Tail pointing right toward the button */}
                <span
                  aria-hidden
                  className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 rotate-45 bg-cyan-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing halo (sits behind the button) */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(236,72,153,0.35) 40%, transparent 70%)",
            filter: "blur(14px)",
          }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sparkle particles drifting around the button (only when closed) */}
        {!open && (
          <>
            <Sparkle delay={0} top="-6px" left="-2px" />
            <Sparkle delay={0.6} top="60%" left="100%" />
            <Sparkle delay={1.2} top="100%" left="20%" />
            <Sparkle delay={1.8} top="10%" left="105%" />
          </>
        )}

        {/* Animated conic-gradient border */}
        <motion.button
          type="button"
          onClick={onClick}
          onMouseEnter={onHover}
          aria-label={open ? "Close assistant" : "Ask me anything"}
          initial={initialProps}
          animate={animateProps}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={
            flyFrom
              ? {
                  // Smooth fly from hero CTA to bottom-right corner.
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }
              : isBumping
              ? {
                  // Bump cycle every ~3.5s while attract mode is on.
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  ease: "easeInOut",
                }
              : { type: "spring", stiffness: 220, damping: 18 }
          }
          onAnimationComplete={() => {
            if (flyFrom) onFlyComplete();
          }}
          className="relative inline-flex items-center justify-center rounded-full p-[2px] shadow-[0_8px_32px_-8px_rgba(168,85,247,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 overflow-hidden"
        >
          {/* Rotating gradient ring */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #a855f7, #ec4899, #f59e0b, #06b6d4, #6366f1, #a855f7)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner pill */}
          <span className="relative z-10 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-background/95 backdrop-blur text-foreground font-medium">
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex"
                >
                  <X size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="sparkle"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex"
                >
                  <Sparkles
                    size={18}
                    className="text-fuchsia-500 drop-shadow-[0_0_6px_rgba(236,72,153,0.7)]"
                  />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline text-sm bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
              {open ? "Close" : "Ask AI"}
            </span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const Sparkle = ({
  delay,
  top,
  left,
}: {
  delay: number;
  top: string;
  left: string;
}) => (
  <motion.span
    aria-hidden
    className="absolute pointer-events-none"
    style={{ top, left }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -10, -18],
    }}
    transition={{
      duration: 2.4,
      repeat: Infinity,
      delay,
      ease: "easeOut",
    }}
  >
    <Sparkles size={10} className="text-fuchsia-400" />
  </motion.span>
);

const Bubble = ({
  msg,
  animate = false,
  onScrollTick,
  onDone,
}: {
  msg: Msg;
  animate?: boolean;
  onScrollTick?: () => void;
  onDone?: () => void;
}) => {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap text-left",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-background/80 border border-border rounded-bl-sm"
        )}
      >
        {animate ? (
          <Typewriter text={msg.content} onTick={onScrollTick} onDone={onDone} />
        ) : (
          msg.content
        )}
      </div>
    </div>
  );
};

const Typewriter = ({
  text,
  onTick,
  onDone,
}: {
  text: string;
  onTick?: () => void;
  onDone?: () => void;
}) => {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setShown(0);
    doneRef.current = false;
    const id = window.setInterval(() => {
      setShown((prev) => {
        const next = Math.min(prev + TYPE_CHARS_PER_TICK, text.length);
        if (next >= text.length) {
          window.clearInterval(id);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
        }
        onTick?.();
        return next;
      });
    }, TYPE_TICK_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const isDone = shown >= text.length;
  return (
    <>
      {text.slice(0, shown)}
      {!isDone && (
        <motion.span
          aria-hidden
          className="inline-block w-[2px] h-[0.95em] align-[-2px] ml-[1px] bg-primary"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </>
  );
};

const Dot = ({ delay }: { delay: number }) => (
  <motion.span
    className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
    animate={{ opacity: [0.3, 1, 0.3] }}
    transition={{ duration: 1.2, repeat: Infinity, delay }}
  />
);
