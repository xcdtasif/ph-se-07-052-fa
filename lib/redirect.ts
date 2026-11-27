/*
Returns `path` when it is a path on this site, or `fallback` otherwise. Used on
`?redirectTo=` values, which come from the URL and could point anywhere: a
value like `//evil.com` or `/\evil.com` is read by browsers as another site.
*/
export const safeRedirectPath = (path: string | null | undefined, fallback = "/"): string =>
  path?.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : fallback
