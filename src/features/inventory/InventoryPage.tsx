import { useMemo, useState } from 'react';
import { useInventory } from '../../app/providers/InventoryProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { StatusBadge } from '../../shared/components/StatusBadge';

export function InventoryPage() {
  const inventory = useInventory();
  const auth = useAuth();
  const [query, setQuery] = useState('');
  const [alertsOnly, setAlertsOnly] = useState(false);
  const visible = useMemo(() => inventory.reports.filter(report =>
    report.sheetName.toLowerCase().includes(query.toLowerCase()) && (!alertsOnly || report.hasLowStock)), [alertsOnly, inventory.reports, query]);
  const shortages = inventory.reports.filter(report => report.hasLowStock).length;
  const lowItems = inventory.reports.reduce((sum, report) => sum + report.lowItems.length, 0);

  return <div className="stack-lg">
    <div className="stats-grid">
      <Card><div className="stat"><span>Units</span><strong>{inventory.reports.length}</strong></div></Card>
      <Card><div className="stat"><span>Shortages</span><strong>{shortages}</strong></div></Card>
      <Card><div className="stat"><span>Restock items</span><strong>{lowItems}</strong></div></Card>
    </div>
    <Card>
      <div className="toolbar">
        <div>
          <h2>Inventory</h2>
          <p>{inventory.title} {inventory.syncedAt ? `• synced ${new Date(inventory.syncedAt).toLocaleString()}` : ''}</p>
        </div>
        <div className="toolbar__actions">
          <input className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search apartment" />
          <Button variant={alertsOnly ? 'primary' : 'secondary'} onClick={() => setAlertsOnly(value => !value)}>{alertsOnly ? 'Showing alerts' : 'All units'}</Button>
          {auth.sheetsAccessToken ? <Button onClick={() => void inventory.refresh()} disabled={inventory.loading}>{inventory.loading ? 'Refreshing…' : 'Refresh Sheets'}</Button> : <Button onClick={() => void auth.connectSheets()} disabled={auth.connectingSheets}>{auth.connectingSheets ? 'Connecting…' : 'Connect Google Sheets'}</Button>}
        </div>
      </div>
      <details className="settings-disclosure">
        <summary>Sheets settings</summary>
        <div className="form-grid settings-grid">
          <label><span>Spreadsheet URL or ID</span><input className="input" value={inventory.spreadsheetInput} onChange={event => inventory.setSpreadsheetInput(event.target.value)} /></label>
          <label><span>Low-stock values</span><input className="input" value={inventory.shortageTermsInput} onChange={event => inventory.setShortageTermsInput(event.target.value)} /></label>
        </div>
      </details>
      {inventory.error && <div className="notice notice--warn">{inventory.error}</div>}
    </Card>
    <div className="card-grid">
      {visible.map(report => <Card key={report.sheetName}>
        <div className="card-heading"><div><span className="eyebrow">Apartment</span><h3>{report.sheetName}</h3></div><StatusBadge tone={report.hasLowStock ? 'danger' : 'good'}>{report.hasLowStock ? `${report.lowItems.length} low` : 'Stocked'}</StatusBadge></div>
        {report.lastRowIndex === 0 ? <p className="muted">No data rows.</p> : <div className="inventory-list">{report.headers.map((header, index) => {
          const value = report.values[index] || '—';
          const isLow = report.lowItems.some(item => item.name === header);
          return <div className={`inventory-row ${isLow ? 'inventory-row--low' : ''}`} key={`${header}:${index}`}><span>{header}</span><strong>{value}</strong></div>;
        })}</div>}
      </Card>)}
    </div>
  </div>;
}
