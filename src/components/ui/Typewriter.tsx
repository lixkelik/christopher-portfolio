import { useEffect, useState } from "react";

type Props = {
  words: string[];
  /** ms per character */
  typeSpeed?: number;
  /** ms per character while deleting */
  deleteSpeed?: number;
  /** pause when fully typed */
  pause?: number;
  className?: string;
};

export const Typewriter = ({
  words,
  typeSpeed = 70,
  deleteSpeed = 35,
  pause = 1400,
  className,
}: Props) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && text === word) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    } else {
      timer = setTimeout(
        () => {
          setText((prev) =>
            deleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1)
          );
        },
        deleting ? deleteSpeed : typeSpeed
      );
    }
    return () => clearTimeout(timer);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause]);

  return (
    <span className={className}>
      {text}
      <span
        className="inline-block w-[2px] h-[1em] -mb-[2px] ml-[2px] bg-current align-middle animate-pulse"
        aria-hidden="true"
      />
    </span>
  );
};
