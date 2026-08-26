import { useMemo, useState } from 'react';
import { useInventory } from '../../app/providers/InventoryProvider';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { CopyButton } from '../../shared/components/CopyButton';
import { dispatchNotification } from '../../infrastructure/notifications/dispatch';
import { useNotificationConfigs } from './useNotificationConfigs';

export function NotificationsPage() {
  const { reports } = useInventory();
  const [configs, setConfigs] = useNotificationConfigs();
  const alerts = reports.filter(report => report.hasLowStock);
  const [selected, setSelected] = useState<string[]>(() => alerts.map(report => report.sheetName));
  const [result, setResult] = useState('');
  const selectedReports = alerts.filter(report => selected.includes(report.sheetName));
  const message = useMemo(() => selectedReports.length
    ? `${selectedReports.map(room => `⚠️ Apartment ${room.sheetName} is low on: ${room.lowItems.map(item => item.name).join(', ')}.`).join('\n')}\n\nCould you please help me buy the items and remember to keep the receipt so Nathan can transfer the money back to you?\n\nAlso, please fill in the inventory status in the Stock Tracker file.`
    : 'No apartments selected.', [selectedReports]);

  const send = async () => {
    const response = await dispatchNotification(configs, message, 'Stock Shortage Alert');
    setResult(response.delivered.length ? `Sent to ${response.delivered.join(', ')}${response.errors.length ? `. Errors: ${response.errors.join('; ')}` : ''}` : response.errors.join('; ') || 'No channel is enabled.');
  };

  return <div className="split-layout">
    <div className="stack-lg">
      <Card><div className="card-heading"><div><span className="eyebrow">Shortage alerts</span><h2>Select apartments</h2></div><span>{selected.length}/{alerts.length}</span></div>
        <div className="selection-list">{alerts.map(report => <label key={report.sheetName} className="selection-row"><input type="checkbox" checked={selected.includes(report.sheetName)} onChange={() => setSelected(current => current.includes(report.sheetName) ? current.filter(name => name !== report.sheetName) : [...current, report.sheetName])} /><span><strong>{report.sheetName}</strong><small>{report.lowItems.map(item => item.name).join(', ')}</small></span></label>)}</div>
      </Card>
      <Card><h3>Delivery channels</h3><div className="form-grid">
        <label><span>Telegram bot token</span><input className="input" value={configs.telegram.botToken} onChange={e => setConfigs({...configs, telegram:{...configs.telegram, botToken:e.target.value}})} /></label>
        <label><span>Telegram chat ID</span><input className="input" value={configs.telegram.chatId} onChange={e => setConfigs({...configs, telegram:{...configs.telegram, chatId:e.target.value}})} /></label>
        <label><span>Discord webhook</span><input className="input" value={configs.discord.webhookUrl} onChange={e => setConfigs({...configs, discord:{...configs.discord, webhookUrl:e.target.value}})} /></label>
        <label><span>Custom webhook</span><input className="input" value={configs.webhook.url} onChange={e => setConfigs({...configs, webhook:{...configs.webhook, url:e.target.value}})} /></label>
        <label><span>Pushover user key</span><input className="input" value={configs.pushover.userKey} onChange={e => setConfigs({...configs, pushover:{...configs.pushover, userKey:e.target.value}})} /></label>
        <label><span>Pushover API token</span><input className="input" value={configs.pushover.apiToken} onChange={e => setConfigs({...configs, pushover:{...configs.pushover, apiToken:e.target.value}})} /></label>
      </div><div className="channel-toggles">
        {(['telegram','discord','webhook','pushover'] as const).map(key => <label key={key}><input type="checkbox" checked={configs[key].enabled} onChange={e => setConfigs({...configs, [key]: {...configs[key], enabled:e.target.checked}})} /> {key}</label>)}
      </div></Card>
    </div>
    <Card className="preview-card"><span className="eyebrow">Message preview</span><pre className="message-preview">{message}</pre><div className="toolbar__actions"><CopyButton value={message} label="Copy message" /><Button onClick={() => void send()}>Send</Button></div>{result && <div className="notice">{result}</div>}</Card>
  </div>;
}
