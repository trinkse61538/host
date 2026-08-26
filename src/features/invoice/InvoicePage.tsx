import { useEffect, useMemo, useState } from 'react';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { AppIcon } from '../../shared/components/AppIcon';
import {
  copyInvoiceImage,
  downloadInvoicePdf,
  downloadInvoicePng,
  shareInvoiceImage,
  type InvoiceExportData,
  type InvoiceExportLine,
} from './invoiceExport';
import { defaultCleanerPrice, formatAud } from './pricing';

interface InvoiceLine extends InvoiceExportLine {
  id: string;
  apartmentId: string;
}

interface InvoiceDraft {
  invoiceNo: string;
  issueDate: string;
  invoiceMonth: string;
  cleanerName: string;
  clientName: string;
  lines: InvoiceLine[];
}

type ExportAction = '' | 'copy' | 'share' | 'png' | 'pdf';

const DRAFT_KEY = 'host_cleaner_invoice_v3';

function today(): string { return new Date().toISOString().slice(0, 10); }
function monthNow(): string { return new Date().toISOString().slice(0, 7); }
function invoiceNo(month = monthNow()): string { return `INV-${month.replace('-', '')}-001`; }
function initialDraft(): InvoiceDraft {
  return {
    invoiceNo: invoiceNo(),
    issueDate: today(),
    invoiceMonth: monthNow(),
    cleanerName: '',
    clientName: 'Nathan',
    lines: [],
  };
}

function loadDraft(): InvoiceDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY) || localStorage.getItem('host_cleaner_invoice_v2');
    if (!raw) return initialDraft();
    const parsed = JSON.parse(raw) as InvoiceDraft;
    if (!parsed || !Array.isArray(parsed.lines)) return initialDraft();
    return { ...initialDraft(), ...parsed };
  } catch {
    return initialDraft();
  }
}

function serviceDates(input: string, month: string): { dates: string[]; invalid: string[] } {
  const [year, monthNumber] = month.split('-').map(Number);
  const invalid: string[] = [];
  const dates: string[] = [];
  input.split(/[;,\s]+/).map(value => value.trim()).filter(Boolean).forEach(token => {
    const day = Number(token);
    const date = new Date(year, monthNumber - 1, day);
    if (
      !Number.isInteger(day)
      || day < 1
      || day > 31
      || date.getFullYear() !== year
      || date.getMonth() !== monthNumber - 1
      || date.getDate() !== day
    ) {
      invalid.push(token);
    } else {
      dates.push(`${month}-${String(day).padStart(2, '0')}`);
    }
  });
  return { dates: [...new Set(dates)].sort(), invalid };
}

function displayDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function servicePeriod(lines: InvoiceLine[]): string {
  const dates = lines.flatMap(line => line.serviceDates).filter(Boolean).sort();
  if (!dates.length) return '—';
  if (dates[0] === dates[dates.length - 1]) return displayDate(dates[0]);
  return `${displayDate(dates[0])} – ${displayDate(dates[dates.length - 1])}`;
}

export function InvoicePage() {
  const { apartments } = useApartments();
  const { text } = useLocale();
  const [draft, setDraft] = useState<InvoiceDraft>(() => loadDraft());
  const [query, setQuery] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [days, setDays] = useState('');
  const [shifts, setShifts] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'good' | 'warn'>('good');
  const [exporting, setExporting] = useState<ExportAction>('');

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return apartments.filter(apartment =>
      !needle
      || `${apartment.apartment} ${apartment.propertyAddress}`.toLowerCase().includes(needle),
    );
  }, [apartments, query]);

  const selected = apartments.find(apartment => apartment.id === apartmentId) || null;
  const totalShifts = draft.lines.reduce((sum, line) => sum + line.shifts, 0);
  const grandTotal = draft.lines.reduce((sum, line) => sum + line.shifts * line.unitPrice, 0);
  const period = servicePeriod(draft.lines);

  const exportData: InvoiceExportData = {
    invoiceNo: draft.invoiceNo,
    issueDate: draft.issueDate,
    cleanerName: draft.cleanerName,
    clientName: draft.clientName,
    lines: draft.lines,
    servicePeriod: period,
    totalShifts,
    grandTotal,
  };

  const flash = (message: string, tone: 'good' | 'warn' = 'good') => {
    setNotice(message);
    setNoticeTone(tone);
    window.setTimeout(() => setNotice(current => current === message ? '' : current), 2600);
  };

  const chooseApartment = (id: string) => {
    setApartmentId(id);
    const apartment = apartments.find(item => item.id === id);
    setUnitPrice(apartment ? defaultCleanerPrice(apartment) : 0);
    setNotice('');
  };

  const addLine = () => {
    if (!selected) {
      flash(text('Hãy chọn căn hộ trước.', 'Select an apartment first.'), 'warn');
      return;
    }
    const parsed = serviceDates(days, draft.invoiceMonth);
    if (parsed.invalid.length) {
      flash(text(
        `Ngày không hợp lệ: ${parsed.invalid.join(', ')}`,
        `Invalid service day(s): ${parsed.invalid.join(', ')}`,
      ), 'warn');
      return;
    }
    if (!parsed.dates.length) {
      flash(text('Hãy nhập ngày dọn, ví dụ 2;5;18.', 'Enter service days, e.g. 2;5;18.'), 'warn');
      return;
    }
    if (shifts < 1 || shifts !== parsed.dates.length) {
      flash(text(
        `Số shift (${shifts}) phải bằng số ngày dọn (${parsed.dates.length}).`,
        `Shifts (${shifts}) must match the number of service dates (${parsed.dates.length}).`,
      ), 'warn');
      return;
    }
    if (!(unitPrice > 0)) {
      flash(text('Cleaner Unit Price phải lớn hơn 0.', 'Cleaner Unit Price must be greater than 0.'), 'warn');
      return;
    }

    setDraft(current => ({
      ...current,
      lines: [
        ...current.lines,
        {
          id: crypto.randomUUID(),
          apartmentId: selected.id,
          apartment: selected.apartment,
          serviceDates: parsed.dates,
          shifts,
          unitPrice,
        },
      ],
    }));
    setApartmentId('');
    setDays('');
    setShifts(1);
    setUnitPrice(0);
    flash(text('Đã thêm vào invoice.', 'Added to invoice.'));
  };

  const runExport = async (action: Exclude<ExportAction, ''>) => {
    if (!draft.lines.length) {
      flash(text('Invoice đang trống.', 'The invoice is empty.'), 'warn');
      return;
    }
    setExporting(action);
    setNotice('');
    try {
      if (action === 'copy') {
        await copyInvoiceImage(exportData);
        flash(text('Đã copy invoice dưới dạng hình ảnh.', 'Invoice image copied to clipboard.'));
      } else if (action === 'share') {
        const shared = await shareInvoiceImage(exportData);
        flash(shared
          ? text('Đã mở bảng Share.', 'Share sheet opened.')
          : text('Thiết bị không hỗ trợ Share file. Đã tải PNG thay thế.', 'File sharing is unavailable. PNG downloaded instead.'));
      } else if (action === 'png') {
        await downloadInvoicePng(exportData);
        flash(text('Đã tải invoice PNG.', 'Invoice PNG downloaded.'));
      } else {
        await downloadInvoicePdf(exportData);
        flash(text('Đã tải invoice PDF.', 'Invoice PDF downloaded.'));
      }
    } catch (error) {
      flash(
        error instanceof Error ? error.message : text('Không thể xuất invoice.', 'Unable to export invoice.'),
        'warn',
      );
    } finally {
      setExporting('');
    }
  };

  const clearInvoice = () => {
    if (draft.lines.length && !confirm(text('Xóa invoice hiện tại?', 'Clear current invoice?'))) return;
    setDraft(initialDraft());
    setApartmentId('');
    setDays('');
    setQuery('');
    setShifts(1);
    setUnitPrice(0);
    setNotice('');
  };

  return (
    <div className="invoice-studio">
      <aside className="invoice-builder stack-lg">
        <Card className="feature-card feature-card--invoice invoice-builder__hero">
          <div className="invoice-builder__heading">
            <div className="invoice-builder__icon"><AppIcon name="invoice" size={20} /></div>
            <div>
              <span className="eyebrow">Cleaner billing</span>
              <h2>{text('Tạo Cleaner Invoice', 'Create Cleaner Invoice')}</h2>
            </div>
            <div className="invoice-builder__total">
              <span>Grand total</span>
              <strong>{formatAud(grandTotal)}</strong>
            </div>
          </div>

          <div className="form-grid invoice-meta-form">
            <Field label="Invoice No" value={draft.invoiceNo} onChange={value => setDraft(current => ({ ...current, invoiceNo: value }))} />
            <DateField label={text('Ngày phát hành', 'Issue date')} value={draft.issueDate} onChange={value => setDraft(current => ({ ...current, issueDate: value }))} />
            <MonthField
              label={text('Tháng dịch vụ', 'Service month')}
              value={draft.invoiceMonth}
              onChange={value => setDraft(current => ({
                ...current,
                invoiceMonth: value,
                invoiceNo: current.invoiceNo === invoiceNo(current.invoiceMonth) ? invoiceNo(value) : current.invoiceNo,
              }))}
            />
            <Field label={text('Tên cleaner', 'Cleaner name')} value={draft.cleanerName} onChange={value => setDraft(current => ({ ...current, cleanerName: value }))} />
            <div className="field-wide">
              <Field label="Bill to / Client" value={draft.clientName} onChange={value => setDraft(current => ({ ...current, clientName: value }))} />
            </div>
          </div>

          <div className="invoice-builder__divider" />

          <div className="card-heading invoice-section-heading">
            <div>
              <span className="eyebrow">Add service</span>
              <h3>{text('Thêm căn hộ', 'Add apartment service')}</h3>
            </div>
            <span className="invoice-line-count">{draft.lines.length} line{draft.lines.length === 1 ? '' : 's'}</span>
          </div>

          <div className="form-grid">
            <label className="field-wide">
              <span>{text('Tìm căn hộ', 'Search apartment')}</span>
              <div className="input-with-icon">
                <AppIcon name="search" size={16} />
                <input
                  className="input"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={text('Tên căn hộ hoặc địa chỉ', 'Apartment name or address')}
                />
              </div>
            </label>
            <label className="field-wide">
              <span>{text('Chọn căn hộ', 'Apartment')}</span>
              <select className="input" value={apartmentId} onChange={event => chooseApartment(event.target.value)}>
                <option value="">— Select apartment —</option>
                {options.map(apartment => <option key={apartment.id} value={apartment.id}>{apartment.apartment}</option>)}
              </select>
            </label>
            <label>
              <span>{text('Ngày dọn', 'Service days')}</span>
              <input className="input" value={days} onChange={event => setDays(event.target.value)} placeholder="2; 5; 18" />
            </label>
            <label>
              <span>Shifts</span>
              <input className="input" type="number" min="1" value={shifts} onChange={event => setShifts(Math.max(1, Number(event.target.value) || 1))} />
            </label>
            <label className="field-wide">
              <span>Cleaner Unit Price (AUD)</span>
              <div className="money-input">
                <span>$</span>
                <input className="input" type="number" min="0" step="0.01" value={unitPrice || ''} onChange={event => setUnitPrice(Number(event.target.value) || 0)} />
              </div>
            </label>
          </div>

          <Button onClick={addLine}>
            <AppIcon name="plus" size={16} />
            {text('Add to Invoice', 'Add to Invoice')}
          </Button>

          {notice && (
            <div className={noticeTone === 'good' ? 'notice notice--good invoice-toast' : 'notice notice--warn invoice-toast'}>
              <AppIcon name={noticeTone === 'good' ? 'check' : 'alert'} size={16} />
              <span>{notice}</span>
            </div>
          )}
        </Card>

        <Card className="invoice-service-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Service queue</span>
              <h3>{text('Các dòng đã thêm', 'Added services')}</h3>
            </div>
            <span className="badge badge--info">{totalShifts} shifts</span>
          </div>

          <div className="invoice-service-list">
            {draft.lines.map(line => (
              <div className="invoice-service-item" key={line.id}>
                <div className="invoice-service-item__index">{String(draft.lines.indexOf(line) + 1).padStart(2, '0')}</div>
                <div className="invoice-service-item__body">
                  <strong>{line.apartment}</strong>
                  <span>{line.serviceDates.map(value => value.slice(-2)).join(' · ')} · {line.shifts} shift{line.shifts === 1 ? '' : 's'}</span>
                </div>
                <strong className="invoice-service-item__amount">{formatAud(line.shifts * line.unitPrice)}</strong>
                <button
                  type="button"
                  className="icon-action icon-action--danger"
                  onClick={() => setDraft(current => ({ ...current, lines: current.lines.filter(item => item.id !== line.id) }))}
                  title="Remove"
                >
                  <AppIcon name="trash" size={15} />
                </button>
              </div>
            ))}
            {!draft.lines.length && (
              <div className="invoice-service-empty">
                <AppIcon name="invoice" size={24} />
                <span>{text('Chưa có dịch vụ nào.', 'No services added yet.')}</span>
              </div>
            )}
          </div>
        </Card>
      </aside>

      <main className="invoice-workspace">
        <div className="invoice-workspace__toolbar">
          <div>
            <span className="eyebrow">Live document preview</span>
            <h2>{draft.invoiceNo || 'Cleaner Invoice'}</h2>
            <p>{period} · {totalShifts} shifts · <strong>{formatAud(grandTotal)}</strong></p>
          </div>
          <div className="invoice-export-actions">
            <ExportButton
              label={exporting === 'copy' ? text('Đang copy…', 'Copying…') : text('Copy image', 'Copy image')}
              icon="copy"
              active={exporting === 'copy'}
              onClick={() => void runExport('copy')}
              disabled={Boolean(exporting)}
            />
            <ExportButton
              label={exporting === 'share' ? text('Đang share…', 'Sharing…') : 'Share'}
              icon="share"
              active={exporting === 'share'}
              onClick={() => void runExport('share')}
              disabled={Boolean(exporting)}
            />
            <ExportButton label="PNG" icon="image" active={exporting === 'png'} onClick={() => void runExport('png')} disabled={Boolean(exporting)} />
            <ExportButton label="PDF" icon="file" active={exporting === 'pdf'} onClick={() => void runExport('pdf')} disabled={Boolean(exporting)} />
            <button className="invoice-export-button" type="button" onClick={() => window.print()}>
              <AppIcon name="print" size={16} />
              Print
            </button>
            <button className="invoice-export-button invoice-export-button--danger" type="button" onClick={clearInvoice}>
              <AppIcon name="trash" size={16} />
              {text('Clear', 'Clear')}
            </button>
          </div>
        </div>

        <div className="invoice-paper-shell">
          <InvoiceDocument draft={draft} period={period} totalShifts={totalShifts} grandTotal={grandTotal} />
        </div>

        <div className="invoice-export-hint">
          <AppIcon name="check" size={16} />
          <span>{text(
            'Copy image sẽ copy một invoice PNG hoàn chỉnh vào clipboard — không còn là text thuần.',
            'Copy image puts a complete styled PNG invoice on your clipboard — not plain text.',
          )}</span>
        </div>
      </main>
    </div>
  );
}

function InvoiceDocument({
  draft,
  period,
  totalShifts,
  grandTotal,
}: {
  draft: InvoiceDraft;
  period: string;
  totalShifts: number;
  grandTotal: number;
}) {
  return (
    <article className="invoice-paper">
      <header className="invoice-paper__header">
        <div>
          <div className="invoice-paper__brand">
            <span className="invoice-paper__brand-mark">H</span>
            <span>HOST CONTROL CENTER</span>
          </div>
          <h1>INVOICE</h1>
          <p>Professional Cleaning Services</p>
        </div>
        <dl className="invoice-paper__meta">
          <div><dt>Invoice No</dt><dd>{draft.invoiceNo || '—'}</dd></div>
          <div><dt>Issue Date</dt><dd>{draft.issueDate ? displayDate(draft.issueDate) : '—'}</dd></div>
          <div><dt>Service Period</dt><dd>{period}</dd></div>
        </dl>
      </header>

      <section className="invoice-paper__parties">
        <div>
          <span>Cleaner · Service Provider</span>
          <strong>{draft.cleanerName || '—'}</strong>
          <small>Residential & Property Cleaning Services</small>
        </div>
        <div>
          <span>Bill To · Client</span>
          <strong>{draft.clientName || '—'}</strong>
          <small>Property Management / Host</small>
        </div>
      </section>

      <div className="invoice-paper__table-wrap">
        <table className="invoice-paper__table">
          <thead>
            <tr>
              <th>Service date</th>
              <th>Property</th>
              <th>Shifts</th>
              <th>Unit price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {draft.lines.map(line => (
              <tr key={line.id}>
                <td>{line.serviceDates.map(displayDate).join('; ')}</td>
                <td><strong>{line.apartment}</strong></td>
                <td>{line.shifts}</td>
                <td>{formatAud(line.unitPrice)}</td>
                <td><strong>{formatAud(line.shifts * line.unitPrice)}</strong></td>
              </tr>
            ))}
            {!draft.lines.length && (
              <tr>
                <td colSpan={5} className="invoice-paper__empty">Add a service to generate the invoice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="invoice-paper__footer">
        <div className="invoice-paper__note">
          <span>Shift summary & notes</span>
          <strong>{totalShifts} cleaning shift{totalShifts === 1 ? '' : 's'}</strong>
          <p>Shifts are consolidated by property unit for the selected service period.</p>
        </div>
        <div className="invoice-paper__totals">
          <div><span>Total shifts</span><strong>{totalShifts}</strong></div>
          <div className="invoice-paper__grand"><span>Grand total</span><strong>{formatAud(grandTotal)}</strong></div>
        </div>
      </footer>

      <div className="invoice-paper__bottom">
        <span>Thank you.</span>
        <span>Generated by Host Control Center</span>
      </div>
    </article>
  );
}

function ExportButton({
  label,
  icon,
  active,
  onClick,
  disabled,
}: {
  label: string;
  icon: 'copy' | 'share' | 'image' | 'file';
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button className="invoice-export-button" type="button" onClick={onClick} disabled={disabled}>
      <AppIcon name={active ? 'loader' : icon} size={16} className={active ? 'spin' : ''} />
      {label}
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span>{label}</span><input className="input" value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span>{label}</span><input className="input" type="date" value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function MonthField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span>{label}</span><input className="input" type="month" value={value} onChange={event => onChange(event.target.value)} /></label>;
}
