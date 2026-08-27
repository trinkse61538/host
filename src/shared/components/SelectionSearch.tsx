import { AppIcon } from './AppIcon';
import './SelectionSearch.css';

export function SelectionSearch({
  value,
  onChange,
  placeholder,
  resultCount,
  totalCount,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="selection-search">
      <div className="selection-search__control">
        <AppIcon name="search" size={16} />
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear apartment search"
          >
            ×
          </button>
        )}
      </div>

      <span className="selection-search__count">
        {value.trim()
          ? `${resultCount} of ${totalCount} apartments`
          : `${totalCount} apartments`}
      </span>
    </div>
  );
}
