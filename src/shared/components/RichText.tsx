import type { ReactNode } from 'react';
import './RichText.css';

const TOKEN_PATTERN = /(\*\*[^*]+?\*\*|`[^`]+`|https?:\/\/[^\s<]+)/g;

function trimUrlPunctuation(value: string): { url: string; trailing: string } {
  let url = value;
  let trailing = '';
  while (/[),.;!?]$/.test(url)) {
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}

export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(TOKEN_PATTERN).filter(part => part !== '');
  const children: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      children.push(<strong key={index}>{part.slice(2, -2)}</strong>);
      return;
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      children.push(<code key={index}>{part.slice(1, -1)}</code>);
      return;
    }

    if (/^https?:\/\//i.test(part)) {
      const { url, trailing } = trimUrlPunctuation(part);
      children.push(
        <span key={index}>
          <a href={url} target="_blank" rel="noreferrer noopener">{url}</a>
          {trailing}
        </span>,
      );
      return;
    }

    children.push(part);
  });

  return <span className={`rich-text ${className}`.trim()}>{children}</span>;
}
