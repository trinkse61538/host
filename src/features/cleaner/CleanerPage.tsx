import { useMemo, useState } from 'react';
import { useInventory } from '../../app/providers/InventoryProvider';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { CopyButton } from '../../shared/components/CopyButton';
import { dispatchNotification } from '../../infrastructure/notifications/dispatch';
import { useNotificationConfigs } from '../notifications/useNotificationConfigs';

export function CleanerPage() {
  const { reports } = useInventory();
  const [configs] = useNotificationConfigs();
  const [cleaner, setCleaner] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const message = useMemo(() => {
    const handle = cleaner.trim() ? (cleaner.startsWith('@') ? cleaner : `@${cleaner}`) : '@';
    const unitList = selected.map((name, index) => `${index + 1}. Apartment ${name}`).join('\n');
    return `Hi ${handle}\nJust a quick reminder that you have cleaned ${selected.length || '[No units selected]'} ${selected.length === 1 ? 'unit' : 'units'} today:\n\n${unitList}\n\nCould you please fill in the missing supplies/amenities in the Stock Tracker file?\n\nThank you so much for your help! 🙏`;
  }, [cleaner, selected]);
  const send = async () => {
    const response = await dispatchNotification(configs, message, 'Cleaner Work Reminder');
    setResult(response.delivered.length ? `Sent to ${response.delivered.join(', ')}` : response.errors.join('; ') || 'No channel enabled.');
  };
  return <div className="split-layout"><Card className="feature-card"><span className="eyebrow">Cleaner reminder</span><div className="card-heading"><div><h2>Build reminder</h2><p>Select the apartments cleaned today.</p></div><div className="selection-actions"><Button variant="secondary" onClick={() => setSelected(reports.map(report => report.sheetName))} disabled={!reports.length}>Select all</Button><Button variant="ghost" onClick={() => setSelected([])} disabled={!selected.length}>Deselect all</Button></div></div><label><span>Cleaner handle</span><input className="input" value={cleaner} onChange={e => setCleaner(e.target.value)} placeholder="cleaner name or @handle" /></label><div className="selection-list">{reports.map(report => <label key={report.sheetName} className="selection-row"><input type="checkbox" checked={selected.includes(report.sheetName)} onChange={() => setSelected(current => current.includes(report.sheetName) ? current.filter(name => name !== report.sheetName) : [...current, report.sheetName])}/><span>{report.sheetName}</span></label>)}</div></Card><Card><span className="eyebrow">Preview</span><pre className="message-preview">{message}</pre><div className="toolbar__actions"><CopyButton value={message} label="Copy"/><Button onClick={() => void send()}>Send reminder</Button></div>{result && <div className="notice">{result}</div>}</Card></div>;
}
