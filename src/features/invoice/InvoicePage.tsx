import { useEffect, useMemo, useState } from 'react';
import { useApartments } from '../../app/providers/ApartmentProvider';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { CopyButton } from '../../shared/components/CopyButton';
import { defaultCleanerPrice, formatAud } from './pricing';

interface InvoiceLine {
  id: string;
  apartmentId: string;
  apartment: string;
  serviceDates: string[];
  shifts: number;
  unitPrice: number;
}

interface InvoiceDraft {
  invoiceNo: string;
  issueDate: string;
  invoiceMonth: string;
  cleanerName: string;
  clientName: string;
  lines: InvoiceLine[];
}

const DRAFT_KEY = 'host_cleaner_invoice_v2';

function today(): string { return new Date().toISOString().slice(0, 10); }
function monthNow(): string { return new Date().toISOString().slice(0, 7); }
function invoiceNo(month = monthNow()): string { return `INV-${month.replace('-', '')}-001`; }
function initialDraft(): InvoiceDraft {
  return { invoiceNo: invoiceNo(), issueDate: today(), invoiceMonth: monthNow(), cleanerName: '', clientName: 'Nathan', lines: [] };
}

function loadDraft(): InvoiceDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return initialDraft();
    const parsed = JSON.parse(raw) as InvoiceDraft;
    if (!parsed || !Array.isArray(parsed.lines)) return initialDraft();
    return { ...initialDraft(), ...parsed };
  } catch { return initialDraft(); }
}

function serviceDates(input: string, month: string): { dates: string[]; invalid: string[] } {
  const [year, monthNumber] = month.split('-').map(Number);
  const invalid: string[] = [];
  const dates: string[] = [];
  input.split(/[;,\s]+/).map(value => value.trim()).filter(Boolean).forEach(token => {
    const day = Number(token);
    const date = new Date(year, monthNumber - 1, day);
    if (!Number.isInteger(day) || day < 1 || day > 31 || date.getFullYear() !== year || date.getMonth() !== monthNumber - 1 || date.getDate() !== day) invalid.push(token);
    else dates.push(`${month}-${String(day).padStart(2, '0')}`);
  });
  return { dates: [...new Set(dates)].sort(), invalid };
}

function displayDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
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

  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft]);

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return apartments.filter(apartment => !needle || `${apartment.apartment} ${apartment.propertyAddress}`.toLowerCase().includes(needle));
  }, [apartments, query]);
  const selected = apartments.find(apartment => apartment.id === apartmentId) || null;
  const totalShifts = draft.lines.reduce((sum, line) => sum + line.shifts, 0);
  const grandTotal = draft.lines.reduce((sum, line) => sum + line.shifts * line.unitPrice, 0);

  const chooseApartment = (id: string) => {
    setApartmentId(id);
    const apartment = apartments.find(item => item.id === id);
    setUnitPrice(apartment ? defaultCleanerPrice(apartment) : 0);
    setNotice('');
  };

  const addLine = () => {
    if (!selected) { setNotice(text('Hãy chọn căn hộ trước.', 'Select an apartment first.')); return; }
    const parsed = serviceDates(days, draft.invoiceMonth);
    if (parsed.invalid.length) { setNotice(text(`Ngày không hợp lệ: ${parsed.invalid.join(', ')}`, `Invalid service day(s): ${parsed.invalid.join(', ')}`)); return; }
    if (!parsed.dates.length) { setNotice(text('Hãy nhập ngày dọn, ví dụ 2;5;18.', 'Enter service days, e.g. 2;5;18.')); return; }
    if (shifts < 1 || shifts !== parsed.dates.length) { setNotice(text(`Số shift (${shifts}) phải bằng số ngày dọn (${parsed.dates.length}).`, `Shifts (${shifts}) must match the number of service dates (${parsed.dates.length}).`)); return; }
    if (!(unitPrice > 0)) { setNotice(text('Cleaner Unit Price phải lớn hơn 0.', 'Cleaner Unit Price must be greater than 0.')); return; }
    setDraft(current => ({ ...current, lines: [...current.lines, { id: crypto.randomUUID(), apartmentId: selected.id, apartment: selected.apartment, serviceDates: parsed.dates, shifts, unitPrice }] }));
    setApartmentId(''); setDays(''); setShifts(1); setUnitPrice(0);
    setNotice(text('Đã thêm vào invoice.', 'Added to invoice.'));
    window.setTimeout(() => setNotice(''), 1800);
  };

  const invoiceText = useMemo(() => {
    const lines = draft.lines.map((line, index) => `${index + 1}. ${line.apartment}\n   ${line.serviceDates.map(displayDate).join(', ')}\n   ${line.shifts} × ${formatAud(line.unitPrice)} = ${formatAud(line.shifts * line.unitPrice)}`).join('\n\n');
    return `CLEANER INVOICE\nInvoice: ${draft.invoiceNo}\nIssue date: ${displayDate(draft.issueDate)}\nCleaner: ${draft.cleanerName || '—'}\nBill to: ${draft.clientName || '—'}\n\n${lines || 'No line items'}\n\nTotal shifts: ${totalShifts}\nGRAND TOTAL: ${formatAud(grandTotal)}`;
  }, [draft, grandTotal, totalShifts]);

  return <div className="invoice-layout">
    <div className="stack-lg">
      <Card className="feature-card feature-card--invoice">
        <div className="card-heading"><div><span className="eyebrow">Cleaner billing</span><h2>{text('Tạo Cleaner Invoice', 'Create Cleaner Invoice')}</h2></div><strong className="invoice-total">{formatAud(grandTotal)}</strong></div>
        <div className="form-grid">
          <Field label="Invoice No" value={draft.invoiceNo} onChange={value => setDraft(current => ({ ...current, invoiceNo: value }))} />
          <DateField label={text('Ngày phát hành', 'Issue date')} value={draft.issueDate} onChange={value => setDraft(current => ({ ...current, issueDate: value }))} />
          <MonthField label={text('Tháng dịch vụ', 'Service month')} value={draft.invoiceMonth} onChange={value => setDraft(current => ({ ...current, invoiceMonth: value, invoiceNo: current.invoiceNo === invoiceNo(current.invoiceMonth) ? invoiceNo(value) : current.invoiceNo }))} />
          <Field label={text('Tên cleaner', 'Cleaner name')} value={draft.cleanerName} onChange={value => setDraft(current => ({ ...current, cleanerName: value }))} />
          <Field label="Bill to / Client" value={draft.clientName} onChange={value => setDraft(current => ({ ...current, clientName: value }))} />
        </div>
      </Card>

      <Card>
        <div className="card-heading"><div><span className="eyebrow">Add service</span><h3>{text('Thêm căn hộ vào invoice', 'Add apartment service')}</h3></div></div>
        <div className="form-grid">
          <label><span>{text('Tìm căn hộ', 'Search apartment')}</span><input className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder={text('Nhập tên căn hộ', 'Apartment name')} /></label>
          <label><span>{text('Chọn căn hộ', 'Apartment')}</span><select className="input" value={apartmentId} onChange={event => chooseApartment(event.target.value)}><option value="">— Select —</option>{options.map(apartment => <option key={apartment.id} value={apartment.id}>{apartment.apartment}</option>)}</select></label>
          <label><span>{text('Ngày dọn trong tháng', 'Service days in month')}</span><input className="input" value={days} onChange={event => setDays(event.target.value)} placeholder="2; 5; 18" /></label>
          <label><span>Shifts</span><input className="input" type="number" min="1" value={shifts} onChange={event => setShifts(Math.max(1, Number(event.target.value) || 1))} /></label>
          <label><span>Cleaner Unit Price (AUD)</span><input className="input" type="number" min="0" step="0.01" value={unitPrice || ''} onChange={event => setUnitPrice(Number(event.target.value) || 0)} /></label>
        </div>
        <div className="toolbar__actions invoice-add-action"><Button onClick={addLine}>{text('Add to Invoice', 'Add to Invoice')}</Button></div>
        {notice && <div className="notice">{notice}</div>}
      </Card>

      <div className="table-card invoice-lines">
        <table><thead><tr><th>Apartment</th><th>Service dates</th><th>Shifts</th><th>Unit price</th><th>Amount</th><th /></tr></thead><tbody>
          {draft.lines.map(line => <tr key={line.id}><td><strong>{line.apartment}</strong></td><td>{line.serviceDates.map(value => value.slice(-2)).join(', ')}</td><td>{line.shifts}</td><td>{formatAud(line.unitPrice)}</td><td><strong>{formatAud(line.shifts * line.unitPrice)}</strong></td><td><Button variant="ghost" onClick={() => setDraft(current => ({ ...current, lines: current.lines.filter(item => item.id !== line.id) }))}>Remove</Button></td></tr>)}
          {!draft.lines.length && <tr><td colSpan={6} className="empty-table">{text('Invoice đang trống.', 'Invoice is empty.')}</td></tr>}
        </tbody></table>
      </div>
    </div>

    <Card className="preview-card invoice-preview">
      <span className="eyebrow">Invoice preview</span><pre className="message-preview">{invoiceText}</pre>
      <div className="invoice-summary"><span>{text('Tổng shifts', 'Total shifts')}<strong>{totalShifts}</strong></span><span>Grand Total<strong>{formatAud(grandTotal)}</strong></span></div>
      <div className="toolbar__actions"><CopyButton value={invoiceText} label={text('Copy invoice', 'Copy invoice')} /><Button variant="secondary" onClick={() => window.print()}>{text('Print / Save PDF', 'Print / Save PDF')}</Button><Button variant="danger" onClick={() => { if (!draft.lines.length || confirm(text('Xóa invoice hiện tại?', 'Clear current invoice?'))) setDraft(initialDraft()); }}>{text('Clear', 'Clear')}</Button></div>
    </Card>
  </div>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span>{label}</span><input className="input" value={value} onChange={event => onChange(event.target.value)} /></label>; }
function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span>{label}</span><input className="input" type="date" value={value} onChange={event => onChange(event.target.value)} /></label>; }
function MonthField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span>{label}</span><input className="input" type="month" value={value} onChange={event => onChange(event.target.value)} /></label>; }
