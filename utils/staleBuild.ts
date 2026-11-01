// After a deploy, tabs still running the previous build request lazy chunks
// whose hashed filenames no longer exist. Reload once to pick up the new build.

const RELOAD_KEY = 'gp:stale-build-reload';

const STALE_CHUNK_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|is not a valid JavaScript MIME type/i;

export const isStaleChunkError = (error: unknown) =>
  error instanceof Error && STALE_CHUNK_PATTERN.test(error.message);

/** Reloads the page once per session; returns false if a reload was already attempted. */
export const reloadForNewBuild = (): boolean => {
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false;
    sessionStorage.setItem(RELOAD_KEY, '1');
  } catch {
    // Storage unavailable: reload anyway; a second failure will show the error screen.
  }
  window.location.reload();
  return true;
};

/** Clears the guard once the app has rendered successfully on the new build. */
export const markBuildHealthy = () => {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    // ignore
  }
};
