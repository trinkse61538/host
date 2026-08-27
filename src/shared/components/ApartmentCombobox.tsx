import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { ManagedApartment } from '../../domain/models';
import { AppIcon } from './AppIcon';
import './ApartmentCombobox.css';

interface ApartmentComboboxProps {
  apartments: ManagedApartment[];
  value: string;
  onChange: (apartmentId: string) => void;
  label?: string;
  placeholder: string;
  emptyText?: string;
  getDescription?: (apartment: ManagedApartment) => string;
  getBadge?: (apartment: ManagedApartment) => string;
  getSearchText?: (apartment: ManagedApartment) => string;
  className?: string;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function ApartmentCombobox({
  apartments,
  value,
  onChange,
  label,
  placeholder,
  emptyText = 'No matching apartments',
  getDescription,
  getBadge,
  getSearchText,
  className = '',
}: ApartmentComboboxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingRef = useRef(false);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(
    () => apartments.find(apartment => apartment.id === value) || null,
    [apartments, value],
  );

  useEffect(() => {
    if (selected) {
      setInputValue(selected.apartment);
    } else if (!typingRef.current) {
      setInputValue('');
    }
    typingRef.current = false;
  }, [selected, value]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const results = useMemo(() => {
    const query = normalize(inputValue);
    const ranked = apartments
      .map(apartment => {
        const searchable = getSearchText
          ? getSearchText(apartment)
          : `${apartment.apartment} ${apartment.propertyAddress}`;
        const normalizedLabel = normalize(apartment.apartment);
        const normalizedSearch = normalize(searchable);

        let score = 3;
        if (!query) score = 2;
        else if (normalizedLabel.startsWith(query)) score = 0;
        else if (normalizedSearch.includes(query)) score = 1;

        return { apartment, score };
      })
      .filter(item => !query || item.score < 3)
      .sort((a, b) => (
        a.score - b.score
        || a.apartment.apartment.localeCompare(b.apartment.apartment)
      ));

    return ranked.map(item => item.apartment);
  }, [apartments, getSearchText, inputValue]);

  useEffect(() => {
    setActiveIndex(current => Math.min(current, Math.max(0, results.length - 1)));
  }, [results.length]);

  const choose = (apartment: ManagedApartment) => {
    onChange(apartment.id);
    setInputValue(apartment.apartment);
    setOpen(false);
    setActiveIndex(0);
  };

  const clear = () => {
    onChange('');
    setInputValue('');
    setOpen(true);
    setActiveIndex(0);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleInput = (next: string) => {
    typingRef.current = true;
    if (value) onChange('');
    setInputValue(next);
    setOpen(true);
    setActiveIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(current => Math.min(current + 1, Math.max(0, results.length - 1)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(current => Math.max(0, current - 1));
      return;
    }

    if (event.key === 'Enter' && open && results.length) {
      event.preventDefault();
      choose(results[activeIndex] || results[0]);
      return;
    }

    if (event.key === 'Escape') setOpen(false);
  };

  const resultId = (index: number) => `apartment-combobox-result-${index}`;

  return (
    <div ref={rootRef} className={`apartment-combobox ${className}`.trim()}>
      {label && <span className="apartment-combobox__label">{label}</span>}

      <div className={`apartment-combobox__control ${open ? 'apartment-combobox__control--open' : ''}`}>
        <AppIcon name="search" size={16} />
        <input
          ref={inputRef}
          className="apartment-combobox__input"
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={event => handleInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="apartment-combobox-results"
          aria-activedescendant={open && results.length ? resultId(activeIndex) : undefined}
        />

        {(inputValue || value) && (
          <button className="apartment-combobox__clear" type="button" onClick={clear} aria-label="Clear apartment">
            ×
          </button>
        )}

        <button
          className="apartment-combobox__toggle"
          type="button"
          onClick={() => {
            setOpen(current => !current);
            inputRef.current?.focus();
          }}
          aria-label={open ? 'Close apartment list' : 'Show apartment list'}
        >
          <span aria-hidden="true">⌄</span>
        </button>
      </div>

      {open && (
        <div id="apartment-combobox-results" className="apartment-combobox__results" role="listbox">
          {results.length ? (
            <>
              {results.map((apartment, index) => {
                const description = getDescription?.(apartment) || apartment.propertyAddress;
                const badge = getBadge?.(apartment) || '';

                return (
                  <button
                    id={resultId(index)}
                    key={apartment.id}
                    type="button"
                    role="option"
                    aria-selected={value === apartment.id}
                    className={[
                      'apartment-combobox__result',
                      index === activeIndex ? 'apartment-combobox__result--active' : '',
                      value === apartment.id ? 'apartment-combobox__result--selected' : '',
                    ].filter(Boolean).join(' ')}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => choose(apartment)}
                  >
                    <span className="apartment-combobox__result-copy">
                      <strong>{apartment.apartment}</strong>
                      {description && <small>{description}</small>}
                    </span>
                    {badge && <span className="apartment-combobox__badge">{badge}</span>}
                  </button>
                );
              })}

              {!inputValue && results.length > 8 && (
                <div className="apartment-combobox__hint">Type a few letters to narrow the list.</div>
              )}
            </>
          ) : (
            <div className="apartment-combobox__empty">{emptyText}</div>
          )}
        </div>
      )}
    </div>
  );
}
