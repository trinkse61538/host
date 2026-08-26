import { formatAud } from './pricing';

export interface InvoiceExportLine {
  apartment: string;
  serviceDates: string[];
  shifts: number;
  unitPrice: number;
}

export interface InvoiceExportData {
  invoiceNo: string;
  issueDate: string;
  cleanerName: string;
  clientName: string;
  lines: InvoiceExportLine[];
  servicePeriod: string;
  totalShifts: number;
  grandTotal: number;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function safeFileName(value: string): string {
  return (value || 'cleaner-invoice')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cleaner-invoice';
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/png' | 'image/jpeg',
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Unable to create invoice image.')),
      type,
      quality,
    );
  });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }
    let current = words[0];
    for (let index = 1; index < words.length; index += 1) {
      const candidate = `${current} ${words[index]}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[index];
      }
    }
    lines.push(current);
  }

  return lines;
}

function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6,
): number {
  const lines = wrapText(ctx, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return lines.length;
}

export function renderInvoiceCanvas(invoice: InvoiceExportData): HTMLCanvasElement {
  const width = 1400;
  const left = 84;
  const right = 84;
  const contentWidth = width - left - right;
  const rowHeights = invoice.lines.map(line => {
    const propertyLines = Math.max(1, Math.ceil(line.apartment.length / 50));
    const dateText = line.serviceDates.map(formatDate).join('; ');
    const dateLines = Math.max(1, Math.ceil(dateText.length / 24));
    return Math.max(84, 34 + Math.max(propertyLines, dateLines) * 27);
  });
  const height = Math.max(1080, 530 + rowHeights.reduce((sum, value) => sum + value, 0) + 290);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable on this device.');

  const navy = '#102a43';
  const navy2 = '#173a5e';
  const cyan = '#0891b2';
  const blue = '#2563eb';
  const text = '#334155';
  const muted = '#64748b';
  const border = '#dbe5ef';
  const soft = '#f4f8fb';
  const aqua = '#e9f8fb';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const accent = ctx.createLinearGradient(left, 0, width - right, 0);
  accent.addColorStop(0, cyan);
  accent.addColorStop(0.5, blue);
  accent.addColorStop(1, '#4f46e5');

  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, width, 14);

  ctx.fillStyle = navy;
  ctx.fillRect(left, 70, 52, 52);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 25px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('H', left + 26, 96);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = cyan;
  ctx.font = '800 15px Arial, sans-serif';
  ctx.fillText('HOST CONTROL CENTER', left + 70, 88);
  ctx.fillStyle = muted;
  ctx.font = '500 14px Arial, sans-serif';
  ctx.fillText('Property Operations', left + 70, 112);

  ctx.fillStyle = navy;
  ctx.font = '800 62px Arial, sans-serif';
  ctx.fillText('INVOICE', left, 210);
  ctx.fillStyle = muted;
  ctx.font = '400 22px Arial, sans-serif';
  ctx.fillText('Professional Cleaning Services', left, 250);

  ctx.textAlign = 'right';
  const metaX = width - right;
  ctx.fillStyle = cyan;
  ctx.font = '800 14px Arial, sans-serif';
  ctx.fillText('INVOICE NO', metaX, 82);
  ctx.fillStyle = text;
  ctx.font = '800 21px Arial, sans-serif';
  ctx.fillText(invoice.invoiceNo || '—', metaX, 108);

  ctx.fillStyle = muted;
  ctx.font = '700 13px Arial, sans-serif';
  ctx.fillText('ISSUE DATE', metaX, 154);
  ctx.fillStyle = text;
  ctx.font = '500 17px Arial, sans-serif';
  ctx.fillText(invoice.issueDate ? formatDate(invoice.issueDate) : '—', metaX, 177);

  ctx.fillStyle = muted;
  ctx.font = '700 13px Arial, sans-serif';
  ctx.fillText('SERVICE PERIOD', metaX, 215);
  ctx.fillStyle = text;
  ctx.font = '500 17px Arial, sans-serif';
  ctx.fillText(invoice.servicePeriod, metaX, 238);
  ctx.textAlign = 'left';

  ctx.fillStyle = accent;
  ctx.fillRect(left, 292, contentWidth, 5);

  const partyY = 326;
  const partyH = 134;
  const gap = 24;
  const partyW = (contentWidth - gap) / 2;

  ctx.fillStyle = soft;
  roundRect(ctx, left, partyY, partyW, partyH, 18);
  ctx.fill();
  ctx.fillStyle = aqua;
  roundRect(ctx, left + partyW + gap, partyY, partyW, partyH, 18);
  ctx.fill();

  ctx.fillStyle = cyan;
  ctx.font = '800 14px Arial, sans-serif';
  ctx.fillText('CLEANER · SERVICE PROVIDER', left + 24, partyY + 34);
  ctx.fillText('BILL TO · CLIENT', left + partyW + gap + 24, partyY + 34);

  ctx.fillStyle = navy2;
  ctx.font = '800 22px Arial, sans-serif';
  ctx.fillText(invoice.cleanerName || '—', left + 24, partyY + 70);
  ctx.fillText(invoice.clientName || '—', left + partyW + gap + 24, partyY + 70);

  ctx.fillStyle = muted;
  ctx.font = '400 15px Arial, sans-serif';
  ctx.fillText('Residential & Property Cleaning Services', left + 24, partyY + 101);
  ctx.fillText('Property Management / Host', left + partyW + gap + 24, partyY + 101);

  let y = 500;
  const headerH = 68;
  const cols = {
    date: { x: left, w: 250 },
    property: { x: left + 250, w: 500 },
    shifts: { x: left + 750, w: 110 },
    price: { x: left + 860, w: 170 },
    total: { x: left + 1030, w: contentWidth - 1030 },
  };

  ctx.fillStyle = accent;
  roundRect(ctx, left, y, contentWidth, headerH, 14);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 14px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('SERVICE DATE', cols.date.x + 18, y + headerH / 2);
  ctx.fillText('PROPERTY', cols.property.x + 18, y + headerH / 2);
  ctx.textAlign = 'center';
  ctx.fillText('SHIFTS', cols.shifts.x + cols.shifts.w / 2, y + headerH / 2);
  ctx.textAlign = 'right';
  ctx.fillText('UNIT PRICE', cols.price.x + cols.price.w - 18, y + headerH / 2);
  ctx.fillText('TOTAL', cols.total.x + cols.total.w - 18, y + headerH / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  y += headerH;

  if (!invoice.lines.length) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(left, y, contentWidth, 100);
    ctx.fillStyle = muted;
    ctx.font = '500 17px Arial, sans-serif';
    ctx.fillText('No line items yet.', left + 20, y + 58);
    y += 100;
  }

  invoice.lines.forEach((item, index) => {
    const rowH = rowHeights[index];
    ctx.fillStyle = index % 2 ? '#f8fbfd' : '#ffffff';
    ctx.fillRect(left, y, contentWidth, rowH);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y + rowH);
    ctx.lineTo(left + contentWidth, y + rowH);
    ctx.stroke();

    const baseline = y + 34;
    ctx.fillStyle = muted;
    ctx.font = '400 15px Arial, sans-serif';
    drawWrapped(ctx, item.serviceDates.map(formatDate).join('; '), cols.date.x + 18, baseline, cols.date.w - 36, 24, 5);

    ctx.fillStyle = text;
    ctx.font = '800 17px Arial, sans-serif';
    drawWrapped(ctx, item.apartment, cols.property.x + 18, baseline, cols.property.w - 36, 25, 5);

    ctx.textAlign = 'center';
    ctx.font = '600 17px Arial, sans-serif';
    ctx.fillText(String(item.shifts), cols.shifts.x + cols.shifts.w / 2, baseline);

    ctx.textAlign = 'right';
    ctx.font = '500 17px Arial, sans-serif';
    ctx.fillText(formatAud(item.unitPrice), cols.price.x + cols.price.w - 18, baseline);
    ctx.fillStyle = navy2;
    ctx.font = '800 17px Arial, sans-serif';
    ctx.fillText(formatAud(item.shifts * item.unitPrice), cols.total.x + cols.total.w - 18, baseline);
    ctx.textAlign = 'left';

    y += rowH;
  });

  y += 42;
  const noteW = 620;
  ctx.fillStyle = soft;
  roundRect(ctx, left, y, noteW, 128, 18);
  ctx.fill();

  ctx.fillStyle = cyan;
  ctx.font = '800 14px Arial, sans-serif';
  ctx.fillText('SHIFT SUMMARY & NOTES', left + 24, y + 34);
  ctx.fillStyle = navy2;
  ctx.font = '800 19px Arial, sans-serif';
  ctx.fillText(`${invoice.totalShifts} cleaning shift${invoice.totalShifts === 1 ? '' : 's'}`, left + 24, y + 68);
  ctx.fillStyle = muted;
  ctx.font = '400 14px Arial, sans-serif';
  drawWrapped(
    ctx,
    'Shifts are consolidated by property unit for the selected service period.',
    left + 24,
    y + 98,
    noteW - 48,
    20,
    2,
  );

  const summaryX = left + contentWidth - 420;
  ctx.fillStyle = muted;
  ctx.font = '700 14px Arial, sans-serif';
  ctx.fillText('TOTAL SHIFTS', summaryX, y + 28);
  ctx.textAlign = 'right';
  ctx.fillStyle = text;
  ctx.font = '800 18px Arial, sans-serif';
  ctx.fillText(String(invoice.totalShifts), left + contentWidth, y + 28);

  ctx.strokeStyle = border;
  ctx.beginPath();
  ctx.moveTo(summaryX, y + 48);
  ctx.lineTo(left + contentWidth, y + 48);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = navy;
  ctx.font = '800 20px Arial, sans-serif';
  ctx.fillText('GRAND TOTAL', summaryX, y + 92);
  ctx.textAlign = 'right';
  ctx.fillStyle = cyan;
  ctx.font = '800 29px Arial, sans-serif';
  ctx.fillText(formatAud(invoice.grandTotal), left + contentWidth, y + 94);
  ctx.textAlign = 'left';

  const footerY = height - 72;
  ctx.strokeStyle = border;
  ctx.beginPath();
  ctx.moveTo(left, footerY - 22);
  ctx.lineTo(left + contentWidth, footerY - 22);
  ctx.stroke();

  ctx.fillStyle = navy2;
  ctx.font = '800 15px Arial, sans-serif';
  ctx.fillText('THANK YOU.', left, footerY);
  ctx.textAlign = 'right';
  ctx.fillStyle = muted;
  ctx.font = '400 13px Arial, sans-serif';
  ctx.fillText('Generated by Host Control Center', left + contentWidth, footerY);
  ctx.textAlign = 'left';

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export async function copyInvoiceImage(invoice: InvoiceExportData): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('This browser cannot copy images to the clipboard. Use PNG instead.');
  }
  const png = await canvasToBlob(renderInvoiceCanvas(invoice), 'image/png');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
}

export async function downloadInvoicePng(invoice: InvoiceExportData): Promise<void> {
  const png = await canvasToBlob(renderInvoiceCanvas(invoice), 'image/png');
  downloadBlob(png, `${safeFileName(invoice.invoiceNo)}.png`);
}

export async function shareInvoiceImage(invoice: InvoiceExportData): Promise<boolean> {
  const png = await canvasToBlob(renderInvoiceCanvas(invoice), 'image/png');
  const file = new File([png], `${safeFileName(invoice.invoiceNo)}.png`, { type: 'image/png' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({
      title: invoice.invoiceNo || 'Cleaner Invoice',
      text: `Cleaner invoice ${invoice.invoiceNo}`,
      files: [file],
    });
    return true;
  }
  downloadBlob(png, file.name);
  return false;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  chunks.forEach(chunk => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

async function canvasToPdfBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const jpeg = new Uint8Array(await jpegBlob.arrayBuffer());
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let byteLength = 0;

  const add = (value: string | Uint8Array) => {
    const chunk = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(chunk);
    byteLength += chunk.length;
  };

  const addObject = (id: number, body: string | Uint8Array[]) => {
    offsets[id] = byteLength;
    add(`${id} 0 obj\n`);
    if (Array.isArray(body)) body.forEach(add);
    else add(body);
    add('\nendobj\n');
  };

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 22;
  const scale = Math.min(
    (pageWidth - margin * 2) / canvas.width,
    (pageHeight - margin * 2) / canvas.height,
  );
  const drawWidth = canvas.width * scale;
  const drawHeight = canvas.height * scale;
  const drawX = (pageWidth - drawWidth) / 2;
  const drawY = pageHeight - margin - drawHeight;
  const content = `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${drawX.toFixed(2)} ${drawY.toFixed(2)} cm\n/Im0 Do\nQ\n`;

  add('%PDF-1.4\n');
  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  addObject(4, [
    encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
    jpeg,
    encoder.encode('\nendstream'),
  ]);
  addObject(5, `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`);

  const xrefOffset = byteLength;
  add('xref\n0 6\n');
  add('0000000000 65535 f \n');
  for (let id = 1; id <= 5; id += 1) {
    add(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob([concatBytes(chunks)], { type: 'application/pdf' });
}

export async function downloadInvoicePdf(invoice: InvoiceExportData): Promise<void> {
  const canvas = renderInvoiceCanvas(invoice);
  const pdf = await canvasToPdfBlob(canvas);
  downloadBlob(pdf, `${safeFileName(invoice.invoiceNo)}.pdf`);
}
