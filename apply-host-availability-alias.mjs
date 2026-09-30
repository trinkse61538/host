import fs from 'node:fs';

const tsxPath = 'src/features/availability/AvailabilityPage.tsx';
const cssPath = 'src/features/availability/availability.css';

if (!fs.existsSync(tsxPath) || !fs.existsSync(cssPath)) {
  console.error('ERROR: Run this script from the root of the host repository.');
  process.exit(1);
}

let tsx = fs.readFileSync(tsxPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

function replaceOnce(source, oldText, newText, label) {
  if (source.includes(newText)) {
    console.log(`SKIP: ${label} already applied.`);
    return source;
  }
  if (!source.includes(oldText)) {
    console.error(`ERROR: Could not find expected block for: ${label}`);
    process.exit(1);
  }
  return source.replace(oldText, newText);
}

tsx = replaceOnce(
  tsx,
  `interface CalendarListing {
  id: string;
  name: string;
  events: CalendarEvent[];
  error?: string;
}`,
  `interface CalendarListing {
  id: string;
  name: string;
  alias: string;
  events: CalendarEvent[];
  error?: string;
}`,
  'CalendarListing alias'
);

tsx = replaceOnce(
  tsx,
  `interface AvailabilityItem {
  id: string;
  name: string;
  available: boolean | null;`,
  `interface AvailabilityItem {
  id: string;
  name: string;
  alias: string;
  available: boolean | null;`,
  'AvailabilityItem alias'
);

tsx = replaceOnce(
  tsx,
  `<th className="listing-col">{text('Căn hộ', 'Listing')}</th>
                      {dates.map(date => {`,
  `<th className="listing-col">{text('Căn hộ', 'Listing')}</th>
                      <th className="alias-col">Alias</th>
                      {dates.map(date => {`,
  'Alias header column'
);

tsx = replaceOnce(
  tsx,
  `                        <th className="listing-col">
                          <strong title={listing.name}>{listing.name}</strong>
                          {listing.error && <small title={listing.error}>{listing.error}</small>}
                        </th>
                        {dates.map(date => {`,
  `                        <th className="listing-col">
                          <strong title={listing.name}>{listing.name}</strong>
                          {listing.error && <small title={listing.error}>{listing.error}</small>}
                        </th>
                        <td className="alias-col">
                          <strong title={listing.alias}>{listing.alias || '—'}</strong>
                        </td>
                        {dates.map(date => {`,
  'Alias body column'
);

tsx = replaceOnce(
  tsx,
  `{available.length ? available.map(item => <div key={item.id}>✓ <strong>{item.name}</strong></div>) : <p>{text('Không có căn phù hợp.', 'No available listings.')}</p>}`,
  `{available.length ? available.map(item => <div key={item.id}>✓ <strong>{item.name}</strong>{item.alias ? <small>{item.alias}</small> : null}</div>) : <p>{text('Không có căn phù hợp.', 'No available listings.')}</p>}`,
  'Alias in available search results'
);

tsx = replaceOnce(
  tsx,
  `                        ✕ <strong>{item.name}</strong>
                        {item.conflicts?.length ? <small>`,
  `                        ✕ <strong>{item.name}</strong>
                        {item.alias ? <small>{item.alias}</small> : null}
                        {item.conflicts?.length ? <small>`,
  'Alias in unavailable search results'
);

const aliasCss = `

/* Availability alias column */
.availability-calendar .alias-col {
  position: sticky;
  left: 220px;
  z-index: 2;
  min-width: 132px;
  max-width: 132px;
  padding: 10px 12px;
  background: var(--surface);
  text-align: left;
}

.availability-calendar thead .alias-col {
  z-index: 4;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.availability-calendar tbody .alias-col strong {
  display: block;
  overflow: hidden;
  color: var(--text);
  font-size: 10px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .availability-calendar .alias-col {
    left: 176px;
    min-width: 118px;
    max-width: 118px;
  }
}
`;

if (!css.includes('/* Availability alias column */')) {
  css += aliasCss;
} else {
  console.log('SKIP: Alias CSS already applied.');
}

fs.writeFileSync(tsxPath, tsx);
fs.writeFileSync(cssPath, css);

console.log('DONE: Availability alias column applied.');
console.log('Next: npm run check');
