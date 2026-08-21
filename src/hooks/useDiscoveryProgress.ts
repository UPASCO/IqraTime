import { useEffect, useState } from "react";

import { useAppDatabase } from "./AppDatabaseProvider";
import { getRuntimeCorpus } from "@/data/corpus";

export interface DiscoveryProgress {
  readonly discovered: number;
  readonly total: number;
  readonly percent: number;
}

/**
 * Distinct ayat ever recorded in history (any source — notification,
 * shuffle, favorite) against the full runtime corpus. A completion
 * mechanic, not a streak: the only "reward" for progressing is more
 * exposure to the text itself, never a point score or a fear-of-missing
 * penalty for stalling.
 */
export function useDiscoveryProgress(): DiscoveryProgress | undefined {
  const db = useAppDatabase();
  const [progress, setProgress] = useState<DiscoveryProgress | undefined>(undefined);

  useEffect(() => {
    if (!db) return;
    let cancelled = false;
    db.history.countDistinctAyahIds().then((discovered) => {
      if (cancelled) return;
      const total = getRuntimeCorpus().length;
      setProgress({
        discovered,
        total,
        percent: total > 0 ? Math.min(100, Math.round((discovered / total) * 100)) : 0,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  return progress;
}
