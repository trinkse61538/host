import { CopyButton } from './CopyButton';
import './MobileSelectionActionBar.css';

export function MobileSelectionActionBar({
  selectedCount,
  message,
  copyLabel = 'Copy',
}: {
  selectedCount: number;
  message: string;
  copyLabel?: string;
}) {
  if (selectedCount <= 0) return null;

  return (
    <div className="mobile-selection-bar" role="region" aria-label="Selected items quick action">
      <div className="mobile-selection-bar__summary">
        <strong>{selectedCount}</strong>
        <span>{selectedCount === 1 ? 'selected' : 'selected'}</span>
      </div>
      <CopyButton value={message} label={copyLabel} />
    </div>
  );
}
