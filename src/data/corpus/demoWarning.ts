/**
 * Reads the build-time corpus environment. Set via EXPO_PUBLIC_CORPUS_ENV
 * in eas.json build profiles (see docs/RELEASE_CHECKLIST.md). Defaults to
 * "development" so a plain `expo start` never silently behaves like a
 * production build.
 */
export type CorpusEnvironment = "development" | "production";

export function getCorpusEnvironment(): CorpusEnvironment {
  const raw = process.env.EXPO_PUBLIC_CORPUS_ENV;
  return raw === "production" ? "production" : "development";
}

export function isProductionCorpusBuild(): boolean {
  return getCorpusEnvironment() === "production";
}
