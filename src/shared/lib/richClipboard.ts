function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function plainGuestText(value: string): string {
  return value
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    .replace(/`([^`]+?)`/g, '$1')
    .replace(/\r\n/g, '\n');
}

function linkifyHtml(value: string): string {
  return value.replace(
    /(https?:\/\/[^\s<]+)/g,
    url => `<a href="${url}" target="_blank" rel="noreferrer noopener">${url}</a>`,
  );
}

export async function copyRichText(value: string): Promise<void> {
  const plain = plainGuestText(value);

  if (
    navigator.clipboard?.write
    && typeof ClipboardItem !== 'undefined'
    && typeof Blob !== 'undefined'
  ) {
    const escaped = escapeHtml(value);
    const html = linkifyHtml(
      escaped
        .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>'),
    );

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([plain], { type: 'text/plain' }),
          'text/html': new Blob(
            [`<div style="white-space:pre-wrap">${html}</div>`],
            { type: 'text/html' },
          ),
        }),
      ]);
      return;
    } catch {
      // Fall back to clean plain text.
    }
  }

  await navigator.clipboard.writeText(plain);
}
