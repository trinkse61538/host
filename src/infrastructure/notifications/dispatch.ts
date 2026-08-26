import type { NotificationConfigs } from '../../domain/models';

export interface DispatchResult { delivered: string[]; errors: string[]; }

export async function dispatchNotification(configs: NotificationConfigs, message: string, title: string): Promise<DispatchResult> {
  const delivered: string[] = [];
  const errors: string[] = [];

  if (configs.telegram.enabled && configs.telegram.botToken && configs.telegram.chatId) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${configs.telegram.botToken.trim()}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: configs.telegram.chatId.trim(), text: message }),
      });
      if (response.ok) delivered.push('Telegram'); else errors.push(`Telegram HTTP ${response.status}`);
    } catch (error) { errors.push(`Telegram: ${error instanceof Error ? error.message : 'failed'}`); }
  }

  if (configs.discord.enabled && configs.discord.webhookUrl) {
    try {
      const response = await fetch(configs.discord.webhookUrl.trim(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: message }),
      });
      if (response.ok) delivered.push('Discord'); else errors.push(`Discord HTTP ${response.status}`);
    } catch (error) { errors.push(`Discord: ${error instanceof Error ? error.message : 'failed'}`); }
  }

  if (configs.webhook.enabled && configs.webhook.url) {
    try {
      const response = await fetch(configs.webhook.url.trim(), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: message, title }),
      });
      if (response.ok) delivered.push('Webhook'); else errors.push(`Webhook HTTP ${response.status}`);
    } catch (error) { errors.push(`Webhook: ${error instanceof Error ? error.message : 'failed'}`); }
  }

  if (configs.pushover.enabled && configs.pushover.userKey && configs.pushover.apiToken) {
    try {
      const response = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: configs.pushover.apiToken.trim(), user: configs.pushover.userKey.trim(), message, title, priority: 1 }),
      });
      if (response.ok) delivered.push('Pushover'); else errors.push(`Pushover HTTP ${response.status}`);
    } catch (error) { errors.push(`Pushover: ${error instanceof Error ? error.message : 'failed'}`); }
  }

  return { delivered, errors };
}
