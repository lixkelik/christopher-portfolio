import { useEffect, useState } from "react";
import { parseGithubRepo } from "../../lib/utils";
import { Star } from "lucide-react";

type Props = {
  githubUrl?: string;
  className?: string;
};

const CACHE_PREFIX = "ghStars:";

/**
 * Fetches and displays the GitHub star count for a repo URL.
 * Caches result in sessionStorage to be polite with the unauthenticated rate limit.
 */
export const GithubStars = ({ githubUrl, className }: Props) => {
  const repo = parseGithubRepo(githubUrl);
  const [stars, setStars] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!repo) return;
    const key = `${CACHE_PREFIX}${repo.owner}/${repo.repo}`;
    const cached = sessionStorage.getItem(key);
    if (cached !== null) {
      const n = Number(cached);
      if (!Number.isNaN(n)) {
        setStars(n);
        return;
      }
    }
    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { stargazers_count?: number }) => {
        if (cancelled) return;
        const n = d.stargazers_count ?? 0;
        sessionStorage.setItem(key, String(n));
        setStars(n);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (!repo || failed) return null;

  return (
    <span
      className={
        "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full bg-card/60 backdrop-blur-sm " +
        (className ?? "")
      }
      title={`${repo.owner}/${repo.repo} on GitHub`}
    >
      <Star size={12} className="text-yellow-400" />
      {stars === null ? "…" : stars.toLocaleString()}
    </span>
  );
};
