import { logger } from './logger.js';

/**
 * Notify Next.js to revalidate specific paths and cache tags.
 * Runs non-blockingly so failures do not abort backend operations.
 */
export async function triggerNextjsRevalidation(
  paths: string[] = ['/', '/products', '/products/[...slug]'],
  tags: string[] = ['categories', 'catalog-nav', 'catalog-tree', 'products', 'products-featured', 'models', 'navbar', 'pages', 'home']
): Promise<void> {
  const candidates = [
    process.env.FRONTEND_INTERNAL_URL,
    process.env.FRONTEND_URL,
    'http://host.docker.internal:3000',
    'http://localhost:3000',
  ].filter(Boolean) as string[];

  const uniqueUrls = Array.from(new Set(candidates));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    for (const url of uniqueUrls) {
      for (const path of paths) {
        fetch(`${url}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
          signal: controller.signal,
        }).catch((err) => {
          logger.debug(`[Revalidate] URL "${url}" Path "${path}" failed:`, (err as Error)?.message);
        });
      }

      for (const tag of tags) {
        fetch(`${url}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag }),
          signal: controller.signal,
        }).catch((err) => {
          logger.debug(`[Revalidate] URL "${url}" Tag "${tag}" failed:`, (err as Error)?.message);
        });
      }
    }

    clearTimeout(timeoutId);
  } catch (err) {
    logger.debug('[Revalidate] Global revalidation trigger failed:', (err as Error)?.message);
  }
}
