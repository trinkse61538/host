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
import { RichText } from '../../shared/components/RichText';
import { GuideLanguageSwitch } from '../../shared/components/GuideLanguageSwitch';
import { ApartmentCombobox } from '../../shared/components/ApartmentCombobox';
import { findAgentFallback, policyStatus, statusLabel } from './agentPolicy';

export function CheckinPage() {
  const { apartments } = useApartments();
  const { locale, setLocale, text } = useLocale();
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

  const active = activeId ? records.find(record => record.id === activeId) || null : null;
  const steps = active ? (locale === 'vi' ? active.instructionsVi : active.instructionsEn) : [];
  const fullGuide = active
    ? (steps.length
      ? steps.map((step, index) => `${locale === 'vi' ? 'BƯỚC' : 'STEP'} ${index + 1}\n${step}`).join('\n\n')
      : active.instructions)
    : '';

  return (
    <div className="checkin-layout">
      <Card className="checkin-sidebar feature-card feature-card--checkin">
        <div className="stack">
          <span className="eyebrow">Guest access</span>
          <div className="mobile-guide-heading">
            <h2>{text('Hướng dẫn check-in', 'Check-in guides')}</h2>
            <GuideLanguageSwitch value={locale} onChange={setLocale} />
          </div>
          <ApartmentCombobox
            apartments={records}
            value={activeId}
            onChange={setActiveId}
            placeholder={text('Gõ tên căn hộ, địa chỉ hoặc lockbox…', 'Type apartment, address or lockbox…')}
            emptyText={text('Không tìm thấy căn phù hợp.', 'No matching apartment.')}
            getDescription={record => record.lockboxType || record.propertyAddress}
            getBadge={record => policyStatus(record).blocked ? 'NO AIRBNB' : ''}
            getSearchText={record => `${record.apartment} ${record.keyAddress} ${record.propertyAddress} ${record.lockboxType}`}
          />
        </div>
      </Card>

      {!active ? (
        <Card className="empty-state empty-state--checkin">
          <div className="empty-state__icon">K</div>
          <h2>{text('Chọn một căn hộ để xem check-in', 'Select an apartment to view check-in')}</h2>
          <p>{text('Không có căn nào được mở mặc định. Hãy tìm kiếm hoặc chọn căn hộ ở cột bên trái.', 'No apartment opens by default. Search or select one from the left panel.')}</p>
        </Card>
      ) : (
        <div className="stack-lg">
          <ActiveGuideCard apartment={active} fullGuide={fullGuide} />
          <AgentCard apartment={active} />
          <PhotoWalkthrough apartment={active} />
          <StepGuide apartment={active} steps={steps} />
        </div>
      )}
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
    <Card className="feature-card feature-card--checkin active-guide-card">
      <div className="card-heading">
        <div>
          <span className="eyebrow">Active guide</span>
          <h2>{apartment.apartment}</h2>
          {apartment.notes && <p>{apartment.notes}</p>}
        </div>
        <CopyButton value={fullGuide} label="Copy guest guide" rich />
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyError, setCopyError] = useState('');
  if (apartment.photos.length === 0) return null;

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
      <span className="eyebrow">Visual walkthrough</span>
      {copiedIndex !== null && <div className="notice notice--good">✓ Image copied to clipboard.</div>}
      {copyError && <div className="notice notice--danger">{copyError}</div>}
      <div className="photo-grid">
        {apartment.photos.map((photo, index) => {
          const src = photoAssetUrl(photo.path);
          return (
            <figure key={`${photo.path}:${index}`}>
              <img src={src} alt={photo.caption} />
              <figcaption>{photo.caption}</figcaption>
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

function StepGuide({ apartment, steps }: { apartment: ManagedApartment; steps: string[] }) {
  const allSteps = steps
    .map((step, index) => `STEP ${index + 1}\n${step}`)
    .join('\n\n');

  return (
    <Card>
      <div className="card-heading">
        <div>
          <span className="eyebrow">Step-by-step guest message</span>
          <h3>Guest steps</h3>
        </div>
        {steps.length > 0 && (
          <CopyButton value={allSteps} label="Copy all steps" rich />
        )}
      </div>
      {steps.length ? (
        <ol className="step-list">
          {steps.map((step, index) => (
            <li key={index}>
              <span>{index + 1}</span>
              <p><RichText text={step} /></p>
              <CopyButton value={step} rich />
            </li>
          ))}
        </ol>
      ) : (
        <div className="message-preview"><RichText text={apartment.instructions || 'No instructions yet.'} /></div>
      )}
    </Card>
  );
}
