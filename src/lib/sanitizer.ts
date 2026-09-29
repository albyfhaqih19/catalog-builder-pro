import DOMPurify from 'dompurify';

export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  const purify = (DOMPurify as any).default || DOMPurify;
  if (typeof purify?.sanitize === 'function') {
    return purify.sanitize(rawHtml, {
      ADD_ATTR: ['data-cb-type', 'data-cb-id', 'data-cb-field', 'target', 'rel'],
      ADD_TAGS: ['style', 'head', 'body', 'link', 'meta', 'header', 'footer', 'main', 'section', 'article', 'nav'],
      FORCE_BODY: false,
      WHOLE_DOCUMENT: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  }

  return rawHtml;
}
