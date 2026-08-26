import type { ManagedApartment } from '../../domain/models';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { ParkingGuideEditor } from '../parking/ParkingGuideEditor';
import { StaticPhotoEditor } from './StaticPhotoEditor';

interface ApartmentEditorProps {
  apartment: ManagedApartment;
  onChange: (apartment: ManagedApartment) => void;
  onCancel: () => void;
  onSave: () => void;
}

function splitSteps(value: string): string[] {
  return value.split(/\n\s*\n/g).map(item => item.trim()).filter(Boolean);
}

export function ApartmentEditor({ apartment, onChange, onCancel, onSave }: ApartmentEditorProps) {
  const update = <K extends keyof ManagedApartment>(key: K, value: ManagedApartment[K]) => {
    onChange({ ...apartment, [key]: value });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal" onMouseDown={event => event.stopPropagation()}>
        <div className="modal__header">
          <div>
            <span className="eyebrow">Apartment editor</span>
            <h2>{apartment.id ? 'Edit apartment' : 'New apartment'}</h2>
          </div>
          <Button variant="ghost" onClick={onCancel}>Close</Button>
        </div>

        <div className="modal__body stack-lg">
          <Card>
            <h3>Basics</h3>
            <div className="form-grid">
              <Field label="Apartment name" value={apartment.apartment} onChange={value => update('apartment', value)} />
              <Field label="Property address" value={apartment.propertyAddress} onChange={value => update('propertyAddress', value)} />
              <Field label="Wi-Fi name" value={apartment.wifiName} onChange={value => update('wifiName', value)} />
              <Field label="Wi-Fi password" value={apartment.password} onChange={value => update('password', value)} />
              <Field label="Wi-Fi note" value={apartment.wifiNote} onChange={value => update('wifiNote', value)} />
              <NumberField label="Cleaner Unit Price (AUD)" value={apartment.cleanerUnitPrice} onChange={value => update('cleanerUnitPrice', value)} />
            </div>
          </Card>

          <Card>
            <h3>Check-in</h3>
            <div className="form-grid">
              <Field label="Key address" value={apartment.keyAddress} onChange={value => update('keyAddress', value)} />
              <Field label="Map URL" value={apartment.keyMapUrl} onChange={value => update('keyMapUrl', value)} />
              <Field label="Lockbox code" value={apartment.lockboxCode} onChange={value => update('lockboxCode', value)} />
              <Field label="Lockbox type" value={apartment.lockboxType} onChange={value => update('lockboxType', value)} />
            </div>
            <TextArea label="Original instructions" value={apartment.instructions} onChange={value => update('instructions', value)} />
            <TextArea
              label="Vietnamese steps (blank line between steps)"
              value={apartment.instructionsVi.join('\n\n')}
              onChange={value => update('instructionsVi', splitSteps(value))}
            />
            <TextArea
              label="English steps (blank line between steps)"
              value={apartment.instructionsEn.join('\n\n')}
              onChange={value => update('instructionsEn', splitSteps(value))}
            />
          </Card>

          <ParkingGuideEditor apartment={apartment} onChange={onChange} />

          <Card>
            <h3>Agent & Airbnb policy</h3>
            <div className="form-grid">
              <Field label="Agency / property manager" value={apartment.agency} onChange={value => update('agency', value)} />
              <Field label="Agent email" value={apartment.agentEmail} onChange={value => update('agentEmail', value)} />
              <Field label="Agent phone" value={apartment.agentPhone} onChange={value => update('agentPhone', value)} />
              <Field label="Company phone" value={apartment.companyPhone} onChange={value => update('companyPhone', value)} />
              <PolicySelect label="Airbnb allowed by Agent" value={apartment.airbnbAgentStatus} onChange={value => update('airbnbAgentStatus', value)} />
              <PolicySelect label="Airbnb allowed by Building / Strata" value={apartment.airbnbStrataStatus} onChange={value => update('airbnbStrataStatus', value)} />
            </div>
            <TextArea label="Policy note" value={apartment.airbnbPolicyNote} onChange={value => update('airbnbPolicyNote', value)} />
          </Card>

          <StaticPhotoEditor
            apartmentId={apartment.id}
            photos={apartment.photos}
            onChange={photos => update('photos', photos)}
          />

          <div className="modal__footer">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button onClick={onSave}>Save apartment</Button>
          </div>
        </div>
      </div>
    </div>
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

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span>{label}</span>
      <input className="input" type="number" min="0" step="0.01" value={value || ''} onChange={event => onChange(Number(event.target.value) || 0)} />
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

function PolicySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ManagedApartment['airbnbAgentStatus'];
  onChange: (value: ManagedApartment['airbnbAgentStatus']) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <select
        className="input"
        value={value}
        onChange={event => onChange(event.target.value as ManagedApartment['airbnbAgentStatus'])}
      >
        <option value="unknown">Unknown</option>
        <option value="allowed">Allowed</option>
        <option value="not_allowed">Not allowed</option>
        <option value="review">Review</option>
      </select>
    </label>
  );
}
