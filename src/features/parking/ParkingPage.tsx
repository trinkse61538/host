import { useMemo, useState } from 'react';
import type { ManagedApartment } from '../../domain/models';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Card } from '../../shared/components/Card';
import { CopyButton } from '../../shared/components/CopyButton';
import { Button } from '../../shared/components/Button';
import { RichText } from '../../shared/components/RichText';
import { copyImageAsPng } from '../../shared/lib/clipboardImage';
import { photoAssetUrl } from '../../infrastructure/staticMedia/photoAssets';
import { saveApartment } from '../../infrastructure/firebase/apartmentRepository';
import { ParkingGuideEditor } from './ParkingGuideEditor';
import { effectiveParking, hasParkingGuide } from './parkingDefaults';

export function ParkingPage() {
  const { apartments, canEdit } = useApartments();
  const { user } = useAuth();
  const { locale, text } = useLocale();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('');
  const [editing, setEditing] = useState<ManagedApartment | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState('');

  const records = useMemo(() => apartments.filter(hasParkingGuide), [apartments]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter(apartment => `${apartment.apartment} ${apartment.propertyAddress}`.toLowerCase().includes(needle));
  }, [query, records]);

  const active = activeId ? records.find(apartment => apartment.id === activeId) || null : null;
  const parking = active ? effectiveParking(active) : null;
  const parkingSteps = parking
    ? (locale === 'vi' ? parking.instructionsVi : parking.instructionsEn)
    : [];
  const allParkingSteps = parkingSteps
    .map((step, index) => `${locale === 'vi' ? 'BƯỚC' : 'STEP'} ${index + 1}\n${step}`)
    .join('\n\n');

  const openEditor = () => {
    if (!active) return;
    const currentParking = effectiveParking(active) || active.parking;
    setEditing({
      ...structuredClone(active),
      parking: structuredClone(currentParking),
    });
    setEditorError('');
  };

  const saveParking = async () => {
    if (!editing || !user?.email) return;
    setSaving(true);
    setEditorError('');
    try {
      await saveApartment(editing, user.email);
      setEditing(null);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Unable to save parking guide.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
                <div>
                  <span className="eyebrow">{text('Căn hộ đang chọn', 'Selected apartment')}</span>
                  <h2>{active.apartment}</h2>
                </div>
                <div className="toolbar__actions">
                  {canEdit && <Button variant="secondary" onClick={openEditor}>{text('Chỉnh parking', 'Edit parking')}</Button>}
                  {(locale === 'vi' ? parking.messageVi : parking.messageEn) && (
                    <CopyButton value={locale === 'vi' ? parking.messageVi : parking.messageEn} label={text('Copy tin nhắn', 'Copy guest message')} rich />
                  )}
                </div>
              </div>
              <div className="detail-grid">
                <Detail label={text('Tình trạng', 'Status')} value={locale === 'vi' ? parking.statusVi : parking.statusEn} />
                <Detail label={text('Vị trí', 'Location')} value={locale === 'vi' ? parking.locationVi : parking.locationEn} />
                <Detail label={text('Cách vào', 'Access')} value={locale === 'vi' ? parking.accessVi : parking.accessEn} />
                <Detail label={text('Vị trí đậu', 'Parking spot')} value={parking.spot} />
              </div>
              {parking.mapUrl && <div className="toolbar__actions parking-map-action"><Button variant="secondary" onClick={() => window.open(parking.mapUrl, '_blank', 'noopener,noreferrer')}>{text('Mở bản đồ', 'Open map')}</Button></div>}
              {(locale === 'vi' ? parking.noteVi : parking.noteEn) && (
                <div className="notice notice--warn">
                  <RichText text={locale === 'vi' ? parking.noteVi : parking.noteEn} />
                </div>
              )}
            </Card>

            {parkingSteps.length > 0 && (
              <Card>
                <div className="card-heading">
                  <div>
                    <span className="eyebrow">{text('Từng bước', 'Step by step')}</span>
                    <h3>{text('Hướng dẫn cho khách', 'Guest steps')}</h3>
                  </div>
                  <CopyButton
                    value={allParkingSteps}
                    label={text('Copy tất cả', 'Copy all steps')}
                    rich
                  />
                </div>
                <ol className="step-list">
                  {parkingSteps.map((step, index) => (
                    <li key={index}>
                      <span>{index + 1}</span>
                      <p><RichText text={step} /></p>
                      <CopyButton value={step} rich />
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {parking.photos.length > 0 && (
              <ParkingPhotos
                photos={parking.photos}
                locale={locale}
                heading={text('Hình ảnh đậu xe', 'Parking photos')}
              />
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop" onMouseDown={() => !saving && setEditing(null)}>
          <div className="modal parking-modal" onMouseDown={event => event.stopPropagation()}>
            <div className="modal__header">
              <div>
                <span className="eyebrow">Parking editor</span>
                <h2>{editing.apartment}</h2>
              </div>
              <Button variant="ghost" disabled={saving} onClick={() => setEditing(null)}>Close</Button>
            </div>
            <div className="modal__body stack-lg">
              {editorError && <div className="notice notice--danger">{editorError}</div>}
              <ParkingGuideEditor apartment={editing} onChange={setEditing} />
              <div className="modal__footer">
                <Button variant="secondary" disabled={saving} onClick={() => setEditing(null)}>Cancel</Button>
                <Button disabled={saving} onClick={() => void saveParking()}>
                  {saving ? text('Đang lưu…', 'Saving…') : text('Lưu parking', 'Save parking')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ParkingPhotos({
  photos,
  locale,
  heading,
}: {
  photos: ManagedApartment['parking']['photos'];
  locale: 'vi' | 'en';
  heading: string;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyError, setCopyError] = useState('');

  const copyImage = async (src: string, index: number) => {
    try {
      await copyImageAsPng(src);
      setCopyError('');
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(current => current === index ? null : current), 1800);
    } catch (error) {
      setCopiedIndex(null);
      setCopyError(error instanceof Error ? error.message : 'Unable to copy image.');
    }
  };

  return (
    <Card>
      <span className="eyebrow">{heading}</span>
      {copiedIndex !== null && <div className="notice notice--good">✓ Image copied to clipboard.</div>}
      {copyError && <div className="notice notice--danger">{copyError}</div>}
      <div className="photo-grid">
        {photos.map((photo, index) => {
          const src = photoAssetUrl(photo.path);
          const caption = locale === 'vi' ? photo.captionVi : photo.captionEn;
          return (
            <figure key={`${photo.path}:${index}`}>
              <img src={src} alt={caption} />
              <figcaption>{caption}</figcaption>
              {src && (
                <Button variant="secondary" onClick={() => void copyImage(src, index)}>
                  {copiedIndex === index ? 'Copied ✓' : 'Copy image'}
                </Button>
              )}
            </figure>
          );
        })}
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="detail"><span>{label}</span><strong>{value || '—'}</strong>{value && <CopyButton value={value} />}</div>;
}
