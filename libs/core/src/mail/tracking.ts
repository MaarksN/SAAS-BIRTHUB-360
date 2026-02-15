import { env } from '../env';

const TRACKING_DOMAIN =
  env.NODE_ENV === 'production'
    ? 'https://api.salesos.com'
    : 'http://localhost:3000';

export function injectTracking(html: string, trackingId: string): string {
  if (!trackingId) return html;

  // 1. Inject Open Pixel
  const pixelUrl = `${TRACKING_DOMAIN}/api/track/open?id=${trackingId}`;
  const pixelTag = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

  let trackedHtml = html;
  if (trackedHtml.includes('</body>')) {
    trackedHtml = trackedHtml.replace('</body>', `${pixelTag}</body>`);
  } else {
    trackedHtml += pixelTag;
  }

  // 2. Wrap Links (Simple Regex for demo - in prod use robust parser)
  // Replaces href="http..." with href="TRACKING_URL?target=http..."
  const linkRegex = /href=["'](http[^"']+)["']/g;
  trackedHtml = trackedHtml.replace(linkRegex, (match, url) => {
    // Skip mailto, tel, or already tracked
    if (url.startsWith('mailto:') || url.includes('/api/track/')) return match;

    const encodedUrl = encodeURIComponent(url);
    const trackingUrl = `${TRACKING_DOMAIN}/api/track/click?id=${trackingId}&target=${encodedUrl}`;
    return `href="${trackingUrl}"`;
  });

  return trackedHtml;
}
