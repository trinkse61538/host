import { useEffect, useMemo, useState } from 'react';
import { useInventory } from '../../app/providers/InventoryProvider';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { CopyButton } from '../../shared/components/CopyButton';
import { MobileSelectionActionBar } from '../../shared/components/MobileSelectionActionBar';
import { SelectionSearch } from '../../shared/components/SelectionSearch';
import { dispatchNotification } from '../../infrastructure/notifications/dispatch';
import { spreadsheetWebUrl } from '../../infrastructure/google/sheets';
import { useNotificationConfigs } from '../notifications/useNotificationConfigs';
import { buildCleanerMessage } from './messages';

export function CleanerPage() {
  const { reports, spreadsheetInput } = useInventory();
  const [configs] = useNotificationConfigs();
  const [cleaner, setCleaner] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState('');

  useEffect(() => {
    const available = new Set(reports.map(report => report.sheetName));
    setSelected(current => current.filter(name => available.has(name)));
  }, [reports]);

  const visibleReports = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return reports;
    return reports.filter(report => report.sheetName.toLowerCase().includes(needle));
  }, [query, reports]);

  const stockTrackerUrl = useMemo(
    () => spreadsheetWebUrl(spreadsheetInput),
    [spreadsheetInput],
  );

  const message = useMemo(
    () => buildCleanerMessage(cleaner, selected, stockTrackerUrl),
    [cleaner, selected, stockTrackerUrl],
  );

  const toggle = (sheetName: string) => {
    setSelected(current => (
      current.includes(sheetName)
        ? current.filter(name => name !== sheetName)
        : [...current, sheetName]
    ));
  };

  const send = async () => {
    const response = await dispatchNotification(configs, message, 'Cleaner Work Reminder');
    setResult(
      response.delivered.length
        ? `Sent to ${response.delivered.join(', ')}`
        : response.errors.join('; ') || 'No channel enabled.',
    );
  };

  return (
    <>
      <div className="split-layout">
        <Card className="feature-card">
          <span className="eyebrow">Cleaner reminder</span>

          <div className="card-heading">
            <div>
              <h2>Build reminder</h2>
              <p>Select the apartments cleaned today.</p>
            </div>

            <div className="selection-actions">
              <span>{selected.length}/{reports.length}</span>
              <Button
                variant="secondary"
                onClick={() => setSelected(current => Array.from(new Set([
                  ...current,
                  ...visibleReports.map(report => report.sheetName),
                ])))}
                disabled={!visibleReports.length}
              >
                {query.trim() ? 'Select visible' : 'Select all'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelected([])}
                disabled={!selected.length}
              >
                Deselect all
              </Button>
            </div>
          </div>

          <label>
            <span>Cleaner handle</span>
            <input
              className="input"
              value={cleaner}
              onChange={event => setCleaner(event.target.value)}
              placeholder="cleaner name or @handle"
            />
          </label>

          <SelectionSearch
            value={query}
            onChange={setQuery}
            placeholder="Search apartment…"
            resultCount={visibleReports.length}
            totalCount={reports.length}
          />

          {visibleReports.length ? (
            <div className="selection-list">
              {visibleReports.map(report => (
                <label key={report.sheetName} className="selection-row">
                <input
                  type="checkbox"
                  checked={selected.includes(report.sheetName)}
                  onChange={() => toggle(report.sheetName)}
                />
                <span>{report.sheetName}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="selection-search__empty">
              No apartments match “{query}”.
            </div>
          )}
        </Card>

        <Card className="preview-card">
          <span className="eyebrow">Preview</span>
          <pre className="message-preview">{message}</pre>
          <div className="toolbar__actions">
            <CopyButton value={message} label="Copy" />
            <Button onClick={() => void send()} disabled={!selected.length}>Send reminder</Button>
          </div>
          {result && <div className="notice">{result}</div>}
        </Card>
      </div>

      <MobileSelectionActionBar
        selectedCount={selected.length}
        message={message}
        copyLabel="Copy reminder"
      />
    </>
  );
}
