import type { SheetReport } from '../../domain/models';

const SHORTAGE_FOOTER = `Could you please help me buy the items and remember to keep the receipt so Nathan can transfer the money back to you?

Also, please fill in the inventory status in the Stock Tracker file.`;

export function buildShortageMessage(reports: SheetReport[]): string {
  if (reports.length === 0) return 'No apartments selected.';

  const lines = reports.map(
    report => `⚠️ Apartment ${report.sheetName} is low on: ${report.lowItems.map(item => item.name).join(', ')}.`,
  );

  return `${lines.join('\n')}\n\n${SHORTAGE_FOOTER}`;
}
