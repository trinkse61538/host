import type { ManagedApartment, ParkingGuide, ParkingPhoto } from '../../domain/models';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { photoAssetUrl } from '../../infrastructure/staticMedia/photoAssets';
import { effectiveParking } from './parkingDefaults';
import './ParkingGuideEditor.css';

function splitSteps(value: string): string[] {
  return value.split(/\n\s*\n/g).map(item => item.trim()).filter(Boolean);
}

function hasStoredParking(parking: ParkingGuide): boolean {
  return Boolean(
    parking.enabled
    || parking.statusVi
    || parking.statusEn
    || parking.locationVi
    || parking.locationEn
    || parking.accessVi
    || parking.accessEn
    || parking.spot
    || parking.mapUrl
    || parking.noteVi
    || parking.noteEn
    || parking.messageVi
    || parking.messageEn
    || parking.instructionsVi.length
    || parking.instructionsEn.length
    || parking.photos.length,
  );
}

export function ParkingGuideEditor({
  apartment,
  onChange,
}: {
  apartment: ManagedApartment;
  onChange: (apartment: ManagedApartment) => void;
}) {
  const fallback = effectiveParking(apartment);
  const usingSeededDefault = !hasStoredParking(apartment.parking) && Boolean(fallback);
  const parking = usingSeededDefault && fallback ? fallback : apartment.parking;

  const updateParking = (patch: Partial<ParkingGuide>) => {
    onChange({
      ...apartment,
      parking: {
        ...parking,
        ...patch,
      },
    });
  };

  const replacePhotos = (photos: ParkingPhoto[]) => updateParking({ photos });

  return (
    <div className="parking-editor-stack">
      <Card className="feature-card feature-card--parking">
        <div className="card-heading">
          <div>
            <span className="eyebrow">Parking data</span>
            <h3>Parking guide</h3>
            <p>Edit the guest-facing parking guide for this apartment. Changes are saved inside the apartment Firestore document.</p>
          </div>
          <label className="parking-enabled-toggle">
            <input
              type="checkbox"
              checked={parking.enabled}
              onChange={event => updateParking({ enabled: event.target.checked })}
            />
            <span>{parking.enabled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        {usingSeededDefault && (
          <div className="notice notice--warn parking-seeded-notice">
            <span>This apartment is currently showing the seeded parking guide from the app.</span>
            <Button
              variant="secondary"
              onClick={() => fallback && onChange({ ...apartment, parking: structuredClone(fallback) })}
            >
              Make it editable in Firestore
            </Button>
          </div>
        )}

        <div className="form-grid">
          <Field label="Status · Vietnamese" value={parking.statusVi} onChange={value => updateParking({ statusVi: value })} />
          <Field label="Status · English" value={parking.statusEn} onChange={value => updateParking({ statusEn: value })} />
          <Field label="Location · Vietnamese" value={parking.locationVi} onChange={value => updateParking({ locationVi: value })} />
          <Field label="Location · English" value={parking.locationEn} onChange={value => updateParking({ locationEn: value })} />
          <Field label="Access · Vietnamese" value={parking.accessVi} onChange={value => updateParking({ accessVi: value })} />
          <Field label="Access · English" value={parking.accessEn} onChange={value => updateParking({ accessEn: value })} />
          <Field label="Parking spot / bay" value={parking.spot} onChange={value => updateParking({ spot: value })} />
          <Field label="Map URL" value={parking.mapUrl} onChange={value => updateParking({ mapUrl: value })} />
        </div>

        <TextArea label="Guest note · Vietnamese" value={parking.noteVi} onChange={value => updateParking({ noteVi: value })} />
        <TextArea label="Guest note · English" value={parking.noteEn} onChange={value => updateParking({ noteEn: value })} />
      </Card>

      <Card>
        <span className="eyebrow">Guest instructions</span>
        <h3>Step-by-step message</h3>
        <p>You can use <code>**bold text**</code> and <code>`inline code`</code>. The Parking page will render them instead of showing the Markdown markers.</p>
        <TextArea
          label="Vietnamese steps · blank line between steps"
          value={parking.instructionsVi.join('\n\n')}
          onChange={value => updateParking({ instructionsVi: splitSteps(value) })}
        />
        <TextArea
          label="English steps · blank line between steps"
          value={parking.instructionsEn.join('\n\n')}
          onChange={value => updateParking({ instructionsEn: splitSteps(value) })}
        />
        <TextArea label="Full guest message · Vietnamese" value={parking.messageVi} onChange={value => updateParking({ messageVi: value })} />
        <TextArea label="Full guest message · English" value={parking.messageEn} onChange={value => updateParking({ messageEn: value })} />
      </Card>

      <ParkingPhotoEditor photos={parking.photos} onChange={replacePhotos} />

      <Card>
        <details className="parking-internal-details">
          <summary>Internal parking operations</summary>
          <div className="form-grid parking-internal-grid">
            <TextArea label="Internal note · Vietnamese" value={parking.internalNoteVi} onChange={value => updateParking({ internalNoteVi: value })} />
            <TextArea label="Internal note · English" value={parking.internalNoteEn} onChange={value => updateParking({ internalNoteEn: value })} />
            <Field label="Internal email to" value={parking.internalEmailTo} onChange={value => updateParking({ internalEmailTo: value })} />
            <Field label="Internal email subject" value={parking.internalEmailSubject} onChange={value => updateParking({ internalEmailSubject: value })} />
            <TextArea label="Internal email body" value={parking.internalEmailBody} onChange={value => updateParking({ internalEmailBody: value })} />
          </div>
        </details>
      </Card>
    </div>
  );
}

function ParkingPhotoEditor({
  photos,
  onChange,
}: {
  photos: ParkingPhoto[];
  onChange: (photos: ParkingPhoto[]) => void;
}) {
  const updatePhoto = (index: number, patch: Partial<ParkingPhoto>) => {
    onChange(photos.map((photo, photoIndex) => photoIndex === index ? { ...photo, ...patch } : photo));
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <Card>
      <div className="card-heading">
        <div>
          <span className="eyebrow">Git-managed media</span>
          <h3>Parking photos</h3>
          <p>Use paths under <code>media/parking/</code>. The files themselves remain in GitHub; Firestore stores only the path and captions.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => onChange([...photos, { path: '', captionVi: '', captionEn: '' }])}
        >
          Add parking photo
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="notice">No parking photos configured.</div>
      ) : (
        <div className="parking-photo-editor-list">
          {photos.map((photo, index) => {
            const src = photoAssetUrl(photo.path);
            return (
              <div className="parking-photo-editor-row" key={`${photo.path}:${index}`}>
                <div className="parking-photo-editor-preview">
                  {src ? <img src={src} alt={photo.captionEn || photo.captionVi || `Parking ${index + 1}`} /> : <span>No preview</span>}
                </div>
                <div className="parking-photo-editor-fields">
                  <Field
                    label="Repository asset path"
                    value={photo.path}
                    onChange={value => updatePhoto(index, { path: value })}
                  />
                  <Field
                    label="Caption · Vietnamese"
                    value={photo.captionVi}
                    onChange={value => updatePhoto(index, { captionVi: value })}
                  />
                  <Field
                    label="Caption · English"
                    value={photo.captionEn}
                    onChange={value => updatePhoto(index, { captionEn: value })}
                  />
                  <div>
                    <Button variant="danger" onClick={() => removePhoto(index)}>Remove reference</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span>{label}</span>
      <input className="input" value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field-wide">
      <span>{label}</span>
      <textarea className="input textarea" value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}
