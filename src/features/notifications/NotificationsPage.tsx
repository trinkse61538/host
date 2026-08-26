import { useEffect, useMemo, useState } from 'react';
import { useInventory } from '../../app/providers/InventoryProvider';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { CopyButton } from '../../shared/components/CopyButton';
import { MobileSelectionActionBar } from '../../shared/components/MobileSelectionActionBar';
import { dispatchNotification } from '../../infrastructure/notifications/dispatch';
import { buildShortageMessage } from './messages';
import { useNotificationConfigs } from './useNotificationConfigs';

export function NotificationsPage() {
  const { reports } = useInventory();
  const [configs, setConfigs] = useNotificationConfigs();
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState('');

  const alerts = useMemo(
    () => reports.filter(report => report.hasLowStock),
    [reports],
  );

  useEffect(() => {
    const available = new Set(alerts.map(report => report.sheetName));
    setSelected(current => current.filter(name => available.has(name)));
  }, [alerts]);

  const selectedReports = useMemo(
    () => alerts.filter(report => selected.includes(report.sheetName)),
    [alerts, selected],
  );

  const message = useMemo(
    () => buildShortageMessage(selectedReports),
    [selectedReports],
  );

  const toggle = (sheetName: string) => {
    setSelected(current => (
      current.includes(sheetName)
        ? current.filter(name => name !== sheetName)
        : [...current, sheetName]
    ));
  };

  const send = async () => {
    const response = await dispatchNotification(configs, message, 'Stock Shortage Alert');
    setResult(
      response.delivered.length
        ? `Sent to ${response.delivered.join(', ')}${response.errors.length ? `. Errors: ${response.errors.join('; ')}` : ''}`
        : response.errors.join('; ') || 'No channel is enabled.',
    );
  };

  return (
    <>
      <div className="split-layout">
        <div className="stack-lg">
          <Card className="feature-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">Shortage alerts</span>
                <h2>Select apartments</h2>
                <p>Alerts start unselected so a message is never prepared for the wrong apartment by accident.</p>
              </div>

              <div className="selection-actions">
                <span>{selected.length}/{alerts.length}</span>
                <Button
                  variant="secondary"
                  onClick={() => setSelected(alerts.map(report => report.sheetName))}
                  disabled={!alerts.length}
                >
                  Select all
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

            <div className="selection-list">
              {alerts.map(report => (
                <label key={report.sheetName} className="selection-row">
                  <input
                    type="checkbox"
                    checked={selected.includes(report.sheetName)}
                    onChange={() => toggle(report.sheetName)}
                  />
                  <span>
                    <strong>{report.sheetName}</strong>
                    <small>{report.lowItems.map(item => item.name).join(', ')}</small>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h3>Delivery channels</h3>
            <div className="form-grid">
              <label>
                <span>Telegram bot token</span>
                <input
                  className="input"
                  value={configs.telegram.botToken}
                  onChange={event => setConfigs({
                    ...configs,
                    telegram: { ...configs.telegram, botToken: event.target.value },
                  })}
                />
              </label>
              <label>
                <span>Telegram chat ID</span>
                <input
                  className="input"
                  value={configs.telegram.chatId}
                  onChange={event => setConfigs({
                    ...configs,
                    telegram: { ...configs.telegram, chatId: event.target.value },
                  })}
                />
              </label>
              <label>
                <span>Discord webhook</span>
                <input
                  className="input"
                  value={configs.discord.webhookUrl}
                  onChange={event => setConfigs({
                    ...configs,
                    discord: { ...configs.discord, webhookUrl: event.target.value },
                  })}
                />
              </label>
              <label>
                <span>Custom webhook</span>
                <input
                  className="input"
                  value={configs.webhook.url}
                  onChange={event => setConfigs({
                    ...configs,
                    webhook: { ...configs.webhook, url: event.target.value },
                  })}
                />
              </label>
              <label>
                <span>Pushover user key</span>
                <input
                  className="input"
                  value={configs.pushover.userKey}
                  onChange={event => setConfigs({
                    ...configs,
                    pushover: { ...configs.pushover, userKey: event.target.value },
                  })}
                />
              </label>
              <label>
                <span>Pushover API token</span>
                <input
                  className="input"
                  value={configs.pushover.apiToken}
                  onChange={event => setConfigs({
                    ...configs,
                    pushover: { ...configs.pushover, apiToken: event.target.value },
                  })}
                />
              </label>
            </div>

            <div className="channel-toggles">
              {(['telegram', 'discord', 'webhook', 'pushover'] as const).map(key => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={configs[key].enabled}
                    onChange={event => setConfigs({
                      ...configs,
                      [key]: { ...configs[key], enabled: event.target.checked },
                    })}
                  />
                  {' '}{key}
                </label>
              ))}
            </div>
          </Card>
        </div>

        <Card className="preview-card">
          <span className="eyebrow">Message preview</span>
          <pre className="message-preview">{message}</pre>
          <div className="toolbar__actions">
            <CopyButton value={message} label="Copy message" />
            <Button onClick={() => void send()} disabled={!selected.length}>Send</Button>
          </div>
          {result && <div className="notice">{result}</div>}
        </Card>
      </div>

      <MobileSelectionActionBar
        selectedCount={selected.length}
        message={message}
        copyLabel="Copy alert"
      />
    </>
  );
}
