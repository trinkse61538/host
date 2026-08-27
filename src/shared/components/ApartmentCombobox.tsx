import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
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

interface FloatingPanel {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  openAbove: boolean;
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
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingRef = useRef(false);
  const rawId = useId();
  const listboxId = `apartment-results-${rawId.replace(/:/g, '')}`;

  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [browseAll, setBrowseAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [panel, setPanel] = useState<FloatingPanel | null>(null);

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
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target)
        && !resultsRef.current?.contains(target)
      ) {
        setOpen(false);
        setBrowseAll(false);
      }
    };

    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const results = useMemo(() => {
    const query = browseAll ? '' : normalize(inputValue);

    return apartments
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
      ))
      .map(item => item.apartment);
  }, [apartments, browseAll, getSearchText, inputValue]);

  useEffect(() => {
    setActiveIndex(current => Math.min(current, Math.max(0, results.length - 1)));
  }, [results.length]);

  const updatePanelPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root || !open) return;

    const rect = root.getBoundingClientRect();
    const visual = window.visualViewport;

    const viewportLeft = visual?.offsetLeft ?? 0;
    const viewportTop = visual?.offsetTop ?? 0;
    const viewportWidth = visual?.width ?? window.innerWidth;
    const viewportHeight = visual?.height ?? window.innerHeight;
    const viewportRight = viewportLeft + viewportWidth;
    const viewportBottom = viewportTop + viewportHeight;

    const margin = 12;
    const gap = 8;
    const isMobile = viewportWidth <= 900;

    // Desktop gets a wider result panel than the narrow sidebar.
    // Mobile uses almost the entire visual viewport for easier tapping.
    const desiredWidth = isMobile
      ? Math.max(280, viewportWidth - margin * 2)
      : Math.min(Math.max(rect.width, 420), viewportWidth - margin * 2);

    const width = Math.min(desiredWidth, viewportWidth - margin * 2);

    let left = isMobile ? viewportLeft + margin : rect.left;
    left = Math.min(
      Math.max(left, viewportLeft + margin),
      viewportRight - width - margin,
    );

    const availableBelow = viewportBottom - rect.bottom - margin - gap;
    const availableAbove = rect.top - viewportTop - margin - gap;

    const openAbove = availableBelow < 210 && availableAbove > availableBelow;
    const available = Math.max(
      120,
      openAbove ? availableAbove : availableBelow,
    );

    const maxHeight = Math.min(
      isMobile ? 430 : 420,
      available,
    );

    const top = openAbove
      ? Math.max(viewportTop + margin, rect.top - maxHeight - gap)
      : rect.bottom + gap;

    setPanel({
      left,
      top,
      width,
      maxHeight,
      openAbove,
    });
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setPanel(null);
      return;
    }

    updatePanelPosition();

    const onViewportChange = () => updatePanelPosition();

    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    window.visualViewport?.addEventListener('resize', onViewportChange);
    window.visualViewport?.addEventListener('scroll', onViewportChange);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
      window.visualViewport?.removeEventListener('resize', onViewportChange);
      window.visualViewport?.removeEventListener('scroll', onViewportChange);
    };
  }, [open, results.length, updatePanelPosition]);

  const choose = (apartment: ManagedApartment) => {
    onChange(apartment.id);
    setInputValue(apartment.apartment);
    setOpen(false);
    setBrowseAll(false);
    setActiveIndex(0);
  };

  const clear = () => {
    typingRef.current = true;
    onChange('');
    setInputValue('');
    setBrowseAll(true);
    setOpen(true);
    setActiveIndex(0);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleInput = (next: string) => {
    typingRef.current = true;
    if (value) onChange('');
    setInputValue(next);
    setBrowseAll(false);
    setOpen(true);
    setActiveIndex(0);
  };

  const openBrowser = () => {
    setBrowseAll(true);
    setOpen(true);
    setActiveIndex(0);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(current => Math.min(
        current + 1,
        Math.max(0, results.length - 1),
      ));
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

    if (event.key === 'Escape') {
      setOpen(false);
      setBrowseAll(false);
    }
  };

  const resultId = (index: number) => `${listboxId}-${index}`;

  const panelStyle: CSSProperties | undefined = panel
    ? {
        left: `${panel.left}px`,
        top: `${panel.top}px`,
        width: `${panel.width}px`,
        maxHeight: `${panel.maxHeight}px`,
      }
    : undefined;

  const resultPanel = open && panel && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={resultsRef}
          id={listboxId}
          className={[
            'apartment-combobox__results',
            'apartment-combobox__results--portal',
            panel.openAbove ? 'apartment-combobox__results--above' : '',
          ].filter(Boolean).join(' ')}
          style={panelStyle}
          role="listbox"
        >
          <div className="apartment-combobox__results-header">
            <span>
              {results.length} apartment{results.length === 1 ? '' : 's'}
            </span>
            <small>
              {browseAll || !inputValue ? 'Choose an apartment' : `Results for “${inputValue}”`}
            </small>
          </div>

          <div className="apartment-combobox__results-scroll">
            {results.length ? (
              results.map((apartment, index) => {
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
                    onPointerDown={event => event.preventDefault()}
                    onClick={() => choose(apartment)}
                  >
                    <span className="apartment-combobox__result-copy">
                      <strong>{apartment.apartment}</strong>
                      {description && <small>{description}</small>}
                    </span>

                    {badge && (
                      <span className="apartment-combobox__badge">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="apartment-combobox__empty">{emptyText}</div>
            )}
          </div>

          {results.length > 6 && (
            <div className="apartment-combobox__hint">
              Scroll for more · type to narrow results
            </div>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        ref={rootRef}
        className={`apartment-combobox ${className}`.trim()}
      >
        {label && (
          <span className="apartment-combobox__label">{label}</span>
        )}

        <div
          className={[
            'apartment-combobox__control',
            open ? 'apartment-combobox__control--open' : '',
          ].filter(Boolean).join(' ')}
        >
          <AppIcon name="search" size={16} />

          <input
            ref={inputRef}
            className="apartment-combobox__input"
            value={inputValue}
            onFocus={() => {
              setOpen(true);
              if (selected && inputValue === selected.apartment) setBrowseAll(true);
            }}
            onChange={event => handleInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={
              open && results.length ? resultId(activeIndex) : undefined
            }
          />

          {(inputValue || value) && (
            <button
              className="apartment-combobox__clear"
              type="button"
              onClick={clear}
              aria-label="Clear apartment"
            >
              ×
            </button>
          )}

          <button
            className="apartment-combobox__toggle"
            type="button"
            onClick={() => {
              if (open) {
                setOpen(false);
                setBrowseAll(false);
              } else {
                openBrowser();
              }
            }}
            aria-label={open ? 'Close apartment list' : 'Show all apartments'}
          >
            <span aria-hidden="true">⌄</span>
          </button>
        </div>
      </div>

      {resultPanel}
    </>
  );
}
