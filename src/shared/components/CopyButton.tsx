import { useState } from 'react';
import { Button } from './Button';
export function CopyButton({ value, label = 'Copy', beforeCopy }: { value: string; label?: string; beforeCopy?: () => boolean | Promise<boolean> }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (beforeCopy && !(await beforeCopy())) return;
    await navigator.clipboard.writeText(value);
    setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  };
  return <Button variant="secondary" onClick={() => void copy()} disabled={!value}>{copied ? 'Copied' : label}</Button>;
}
