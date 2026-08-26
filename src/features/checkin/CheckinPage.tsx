import { useMemo, useState } from 'react';
import type { ManagedApartment } from '../../domain/models';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Card } from '../../shared/components/Card';
import { CopyButton } from '../../shared/components/CopyButton';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Button } from '../../shared/components/Button';
import { copyImageAsPng } from '../../shared/lib/clipboardImage';
import { photoAssetUrl } from '../../infrastructure/staticMedia/photoAssets';
import { findAgentFallback, policyStatus, statusLabel } from './agentPolicy';

export function CheckinPage() {
  const { apartments } = useApartments();
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('');

  const records = useMemo(
    () => apartments.filter(hasCheckinContent),
    [apartments],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter(record =>
      `${record.apartment} ${record.keyAddress} ${record.propertyAddress}`.toLowerCase().includes(needle),
    );
  }, [query, records]);

  const active = visible.find(record => record.id === activeId) || visible[0];
  if (!active) return <Card>No check-in records available.</Card>;

  const steps = locale === 'vi' ? active.instructionsVi : active.instructionsEn;
  const fullGuide = steps.length
    ? steps.map((step, index) => `${locale === 'vi' ? 'BƯỚC' : 'STEP'} ${index + 1}\n${step}`).join('\n\n')
    : active.instructions;

  return (
    <div className="checkin-layout">
      <Card className="checkin-sidebar">
        <div className="stack">
          <span className="eyebrow">Guest access</span>
          <h2>Check-in guides</h2>
          <input
            className="input"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Find an apartment"
          />
        </div>

        <div className="sidebar-list">
          {visible.map(record => (
            <button
              key={record.id}
              className={`sidebar-item ${active.id === record.id ? 'sidebar-item--active' : ''}`}
              onClick={() => setActiveId(record.id)}
            >
              <span>
                <strong>{record.apartment}</strong>
                <small>{record.lockboxType || record.propertyAddress}</small>
              </span>
              {policyStatus(record).blocked && <StatusBadge tone="danger">NO AIRBNB</StatusBadge>}
            </button>
          ))}
        </div>
      </Card>

      <div className="stack-lg">
        <ActiveGuideCard apartment={active} fullGuide={fullGuide} />
        <AgentCard apartment={active} />
        <PhotoWalkthrough apartment={active} />
        <StepGuide apartment={active} steps={steps} />
      </div>
    </div>
  );
}

function hasCheckinContent(apartment: ManagedApartment): boolean {
  return Boolean(
    apartment.keyAddress
      || apartment.lockboxCode
      || apartment.instructions
      || apartment.instructionsVi.length
      || apartment.instructionsEn.length
      || apartment.photos.length
      || findAgentFallback(apartment),
  );
}

function ActiveGuideCard({ apartment, fullGuide }: { apartment: ManagedApartment; fullGuide: string }) {
  return (
    <Card>
      <div className="card-heading">
        <div>
          <span className="eyebrow">Active guide</span>
          <h2>{apartment.apartment}</h2>
          {apartment.notes && <p>{apartment.notes}</p>}
        </div>
        <CopyButton value={fullGuide} label="Copy guest guide" />
      </div>

      <div className="detail-grid">
        {apartment.lockboxCode && (
          <div className="detail">
            <span>Lockbox</span>
            <strong>{apartment.lockboxCode}</strong>
            <CopyButton value={apartment.lockboxCode} />
          </div>
        )}
        {apartment.keyAddress && (
          <div className="detail">
            <span>Key collection</span>
            <strong>{apartment.keyAddress}</strong>
            <CopyButton value={apartment.keyAddress} />
          </div>
        )}
      </div>
    </Card>
  );
}

function AgentCard({ apartment }: { apartment: ManagedApartment }) {
  const policy = policyStatus(apartment);
  const fallback = policy.fallback;
  const agency = apartment.agency || fallback?.agency || '';
  const email = apartment.agentEmail || fallback?.email || '';
  const phone = apartment.agentPhone || fallback?.phone || '';
  const companyPhone = apartment.companyPhone || fallback?.companyPhone || '';
  const address = apartment.propertyAddress || fallback?.address || '';
  const note = apartment.airbnbPolicyNote || fallback?.note || '';

  if (!agency && !email && !address) return null;

  const confirmBlockedEmailCopy = () => {
    if (!policy.blocked) return true;
    return window.confirm(
      `⚠ Airbnb is NOT allowed/approved for this apartment.\n\n`
      + `Agent: ${statusLabel(policy.agent)}\n`
      + `Building / Strata: ${statusLabel(policy.strata)}\n\n`
      + 'Copy the agent email anyway?',
    );
  };

  return (
    <Card className={policy.blocked ? 'card--danger' : ''}>
      <div className="card-heading">
        <div>
          <span className="eyebrow">Agent information</span>
          <h3>{agency || 'Property manager'}</h3>
          {address && <p>{address}</p>}
        </div>
        {policy.blocked && <StatusBadge tone="danger">NO AIRBNB</StatusBadge>}
      </div>

      <div className="detail-grid">
        <div className="detail">
          <span>Agent email</span>
          <strong>{email || 'Not available'}</strong>
          <CopyButton value={email} label="Copy email" beforeCopy={confirmBlockedEmailCopy} />
        </div>
        <div className="detail">
          <span>Agent / property manager phone</span>
          <strong>{phone || '—'}</strong>
          <CopyButton value={phone} />
        </div>
        {companyPhone && (
          <div className="detail">
            <span>Company phone</span>
            <strong>{companyPhone}</strong>
            <CopyButton value={companyPhone} />
          </div>
        )}
      </div>

      <div className="policy-row">
        <StatusBadge tone={policyTone(policy.agent)}>Agent: {statusLabel(policy.agent)}</StatusBadge>
        <StatusBadge tone={policyTone(policy.strata)}>Building / Strata: {statusLabel(policy.strata)}</StatusBadge>
      </div>
      {note && <div className="notice notice--danger">{note}</div>}
    </Card>
  );
}

function policyTone(status: ManagedApartment['airbnbAgentStatus']): 'danger' | 'good' | 'warn' {
  if (status === 'not_allowed') return 'danger';
  if (status === 'allowed') return 'good';
  return 'warn';
}

function PhotoWalkthrough({ apartment }: { apartment: ManagedApartment }) {
  if (apartment.photos.length === 0) return null;

  return (
    <Card>
      <span className="eyebrow">Visual walkthrough</span>
      <div className="photo-grid">
        {apartment.photos.map((photo, index) => {
          const src = photoAssetUrl(photo.path);
          return (
            <figure key={`${photo.path}:${index}`}>
              <img src={src} alt={photo.caption} />
              <figcaption>{photo.caption}</figcaption>
              {src && (
                <Button
                  variant="secondary"
                  onClick={() => void copyImageAsPng(src).catch(error => {
                    alert(error instanceof Error ? error.message : 'Unable to copy image.');
                  })}
                >
                  Copy image
                </Button>
              )}
            </figure>
          );
        })}
      </div>
    </Card>
  );
}

function StepGuide({ apartment, steps }: { apartment: ManagedApartment; steps: string[] }) {
  return (
    <Card>
      <span className="eyebrow">Step-by-step guest message</span>
      {steps.length ? (
        <ol className="step-list">
          {steps.map((step, index) => (
            <li key={index}>
              <span>{index + 1}</span>
              <p>{step}</p>
              <CopyButton value={step} />
            </li>
          ))}
        </ol>
      ) : (
        <pre className="message-preview">{apartment.instructions || 'No instructions yet.'}</pre>
      )}
    </Card>
  );
}
