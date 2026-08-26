import { useMemo, useState } from 'react';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Card } from '../../shared/components/Card';
import { CopyButton } from '../../shared/components/CopyButton';
import { Button } from '../../shared/components/Button';
import { photoAssetUrl } from '../../infrastructure/staticMedia/photoAssets';
import { effectiveParking, hasParkingGuide } from './parkingDefaults';

export function ParkingPage() {
  const { apartments } = useApartments();
  const { locale, text } = useLocale();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('');

  const records = useMemo(() => apartments.filter(hasParkingGuide), [apartments]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter(apartment => `${apartment.apartment} ${apartment.propertyAddress}`.toLowerCase().includes(needle));
  }, [query, records]);
  const active = activeId ? records.find(apartment => apartment.id === activeId) || null : null;
  const parking = active ? effectiveParking(active) : null;

  return (
    <div className="guide-layout">
      <Card className="guide-sidebar">
        <div className="stack">
          <span className="eyebrow">Parking operations</span>
          <h2>{text('Hướng dẫn đậu xe', 'Parking Guide')}</h2>
          <input className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder={text('Tìm căn hộ', 'Search apartment')} />
          <select className="input" value={activeId} onChange={event => setActiveId(event.target.value)}>
            <option value="">{text('— Chọn căn hộ —', '— Select an apartment —')}</option>
            {visible.map(apartment => <option key={apartment.id} value={apartment.id}>{apartment.apartment}</option>)}
          </select>
        </div>
        <div className="sidebar-list">
          {visible.map(apartment => (
            <button key={apartment.id} className={`sidebar-item ${activeId === apartment.id ? 'sidebar-item--active' : ''}`} onClick={() => setActiveId(apartment.id)}>
              <span><strong>{apartment.apartment}</strong><small>{effectiveParking(apartment)?.spot || effectiveParking(apartment)?.locationEn || ''}</small></span>
            </button>
          ))}
        </div>
      </Card>

      {!active || !parking ? (
        <Card className="empty-state empty-state--parking">
          <div className="empty-state__icon">P</div>
          <h2>{text('Chọn một căn hộ để xem hướng dẫn đậu xe', 'Select an apartment to view its parking guide')}</h2>
          <p>{text('Không có căn nào được mở mặc định. Hãy tìm kiếm hoặc chọn căn hộ ở cột bên trái.', 'No apartment opens by default. Search or select one from the left panel.')}</p>
        </Card>
      ) : (
        <div className="stack-lg">
          <Card className="feature-card feature-card--parking">
            <div className="card-heading">
              <div><span className="eyebrow">{text('Căn hộ đang chọn', 'Selected apartment')}</span><h2>{active.apartment}</h2></div>
              {(locale === 'vi' ? parking.messageVi : parking.messageEn) && <CopyButton value={locale === 'vi' ? parking.messageVi : parking.messageEn} label={text('Copy tin nhắn', 'Copy guest message')} />}
            </div>
            <div className="detail-grid">
              <Detail label={text('Tình trạng', 'Status')} value={locale === 'vi' ? parking.statusVi : parking.statusEn} />
              <Detail label={text('Vị trí', 'Location')} value={locale === 'vi' ? parking.locationVi : parking.locationEn} />
              <Detail label={text('Cách vào', 'Access')} value={locale === 'vi' ? parking.accessVi : parking.accessEn} />
              <Detail label={text('Vị trí đậu', 'Parking spot')} value={parking.spot} />
            </div>
            {parking.mapUrl && <div className="toolbar__actions parking-map-action"><Button variant="secondary" onClick={() => window.open(parking.mapUrl, '_blank', 'noopener,noreferrer')}>{text('Mở bản đồ', 'Open map')}</Button></div>}
            {(locale === 'vi' ? parking.noteVi : parking.noteEn) && <div className="notice notice--warn">{locale === 'vi' ? parking.noteVi : parking.noteEn}</div>}
          </Card>

          {(locale === 'vi' ? parking.instructionsVi : parking.instructionsEn).length > 0 && (
            <Card>
              <span className="eyebrow">{text('Từng bước', 'Step by step')}</span>
              <ol className="step-list">
                {(locale === 'vi' ? parking.instructionsVi : parking.instructionsEn).map((step, index) => (
                  <li key={index}><span>{index + 1}</span><p>{step}</p><CopyButton value={step} /></li>
                ))}
              </ol>
            </Card>
          )}

          {parking.photos.length > 0 && (
            <Card>
              <span className="eyebrow">{text('Hình ảnh đậu xe', 'Parking photos')}</span>
              <div className="photo-grid">
                {parking.photos.map((photo, index) => {
                  const src = photoAssetUrl(photo.path);
                  return <figure key={`${photo.path}:${index}`}><img src={src} alt={locale === 'vi' ? photo.captionVi : photo.captionEn} /><figcaption>{locale === 'vi' ? photo.captionVi : photo.captionEn}</figcaption></figure>;
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail"><span>{label}</span><strong>{value || '—'}</strong>{value && <CopyButton value={value} />}</div>;
}
