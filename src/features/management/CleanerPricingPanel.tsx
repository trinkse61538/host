import { useEffect, useMemo, useState } from 'react';
import type { ManagedApartment } from '../../domain/models';
import { saveCleanerUnitPrice } from '../../infrastructure/firebase/apartmentRepository';
import { defaultCleanerPrice, formatAud } from '../invoice/pricing';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';

export function CleanerPricingPanel({ apartments, actorEmail }: { apartments: ManagedApartment[]; actorEmail: string }) {
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDrafts(current => {
      const next = { ...current };
      for (const apartment of apartments) {
        if (!(apartment.id in next)) {
          const price = apartment.cleanerUnitPrice > 0 ? apartment.cleanerUnitPrice : defaultCleanerPrice(apartment);
          next[apartment.id] = price > 0 ? String(price) : '';
        }
      }
      return next;
    });
  }, [apartments]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return apartments.filter(apartment => !needle || `${apartment.apartment} ${apartment.propertyAddress}`.toLowerCase().includes(needle));
  }, [apartments, query]);

  const save = async (apartment: ManagedApartment) => {
    const value = Number(drafts[apartment.id]);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage('Cleaner Unit Price must be greater than 0.');
      return;
    }
    setSavingId(apartment.id);
    setMessage('');
    try {
      await saveCleanerUnitPrice(apartment.id, value, actorEmail);
      setMessage(`Saved ${apartment.apartment}: ${formatAud(value)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save Cleaner Unit Price.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <Card className="feature-card feature-card--pricing">
      <div className="toolbar">
        <div>
          <span className="eyebrow">Cleaner billing</span>
          <h2>Cleaner Unit Price</h2>
          <p>Default prices from the old system are shown until you save an override to Firestore.</p>
        </div>
        <input className="input cleaner-price-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search apartment" />
      </div>

      {message && <div className="notice notice--good">{message}</div>}

      <div className="cleaner-price-list">
        {visible.map(apartment => {
          const stored = apartment.cleanerUnitPrice > 0;
          const defaultPrice = defaultCleanerPrice(apartment);
          return (
            <div className="cleaner-price-row" key={apartment.id}>
              <div className="cleaner-price-name">
                <strong>{apartment.apartment}</strong>
                <span>{apartment.propertyAddress || apartment.id}</span>
              </div>
              <StatusBadge tone={stored ? 'good' : 'info'}>{stored ? 'Stored' : defaultPrice > 0 ? 'Old default' : 'Set price'}</StatusBadge>
              <label className="cleaner-price-input">
                <span>AUD / clean</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={drafts[apartment.id] ?? ''}
                  onChange={event => setDrafts(current => ({ ...current, [apartment.id]: event.target.value }))}
                />
              </label>
              <Button variant="secondary" disabled={savingId === apartment.id} onClick={() => void save(apartment)}>
                {savingId === apartment.id ? 'Saving…' : 'Save'}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
