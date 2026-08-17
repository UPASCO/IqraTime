import React, { createContext, useContext, useEffect, useState } from "react";

import { getAppDatabase } from "@/storage";
import type { AppDatabase } from "@/storage/types";

const AppDatabaseContext = createContext<AppDatabase | null>(null);

export function AppDatabaseProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    getAppDatabase()
      .then((instance) => {
        if (mounted) setDb(instance);
      })
      .catch((err: Error) => {
        if (mounted) setError(err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    // Storage failed to open entirely — surfaced by the caller via useAppDatabase() throwing is not
    // appropriate this early, so children render null until the app-level error boundary handles it.
    // See docs/KNOWN_LIMITATIONS.md "Unrecoverable storage failure".
    return <>{children}</>;
  }

  return <AppDatabaseContext.Provider value={db}>{children}</AppDatabaseContext.Provider>;
}

/** Returns null while the database is still opening/migrating; screens should render a loading state until non-null. */
export function useAppDatabase(): AppDatabase | null {
  return useContext(AppDatabaseContext);
}
