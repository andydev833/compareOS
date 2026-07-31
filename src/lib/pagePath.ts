export function pagePath(marketSlug: string, slug: string): string {
  return slug === '/' ? `/${marketSlug}/` : `/${marketSlug}${slug}`;
}
