import type { LowItem, SheetReport } from '../../domain/models';

export function extractSpreadsheetId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || trimmed;
}

export function spreadsheetWebUrl(urlOrId: string): string {
  const spreadsheetId = extractSpreadsheetId(urlOrId);
  return spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : '';
}

async function googleFetch(url: string, accessToken: string): Promise<Response> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Google Sheets HTTP ${response.status}`);
  }
  return response;
}

export async function fetchSpreadsheetTitle(spreadsheetId: string, accessToken: string): Promise<string> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const response = await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title`, accessToken);
  const data = await response.json();
  return data?.properties?.title || 'Google Sheets';
}

export async function fetchSpreadsheetReports(
  spreadsheetId: string,
  accessToken: string,
  shortageTerms: string[],
): Promise<SheetReport[]> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const normalizedTerms = shortageTerms.map(term => term.trim().toLowerCase()).filter(Boolean);
  const metadataResponse = await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties.title`,
    accessToken,
  );
  const metadata = await metadataResponse.json();
  const titles: string[] = (metadata?.sheets || []).map((sheet: any) => sheet?.properties?.title).filter(Boolean);

  const results = await Promise.all(titles.map(async sheetTitle => {
    try {
      const quoted = `'${sheetTitle.replace(/'/g, "''")}'`;
      const response = await googleFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(quoted)}?valueRenderOption=FORMATTED_VALUE`,
        accessToken,
      );
      const data = await response.json();
      const rows: string[][] = data?.values || [];
      if (!rows.length) return { sheetName: sheetTitle, lastRowIndex: 0, headers: [], values: [], lowItems: [], hasLowStock: false };
      const headerRowIndex = rows.length >= 3 ? 2 : 0;
      const headers = rows[headerRowIndex].map(value => String(value || '').trim());
      let rowIndex = -1;
      let values: string[] = [];
      for (let index = rows.length - 1; index > headerRowIndex; index -= 1) {
        if (rows[index]?.some(cell => String(cell || '').trim())) {
          rowIndex = index;
          values = headers.map((_, col) => String(rows[index][col] || '').trim());
          break;
        }
      }
      const lowItems: LowItem[] = [];
      values.forEach((value, index) => {
        const header = headers[index];
        if (!header) return;
        const normalized = value.toLowerCase();
        const low = normalizedTerms.some(term => ['0', 'empty', 'out'].includes(term) ? normalized === term : normalized.includes(term));
        if (low) lowItems.push({ name: header, value });
      });
      return { sheetName: sheetTitle, lastRowIndex: rowIndex + 1, headers, values, lowItems, hasLowStock: lowItems.length > 0 };
    } catch {
      return null;
    }
  }));

  return results.filter((report): report is SheetReport => report !== null).sort((a, b) => a.sheetName.localeCompare(b.sheetName));
}
