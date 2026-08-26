import { useState } from 'react';
import { Button } from './Button';
import { copyRichText } from '../lib/richClipboard';

export function CopyButton({
  value,
  label = 'Copy',
  beforeCopy,
  rich = false,
}: {
  value: string;
  label?: string;
  beforeCopy?: () => boolean | Promise<boolean>;
  rich?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (beforeCopy && !(await beforeCopy())) return;
    if (rich) await copyRichText(value);
    else await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="secondary" onClick={() => void copy()} disabled={!value}>
      {copied ? 'Copied' : label}
    </Button>
  );
}
