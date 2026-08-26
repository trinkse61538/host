import { useEffect, useState } from 'react';
import type { NotificationConfigs } from '../../domain/models';
import { readJson, writeJson } from '../../shared/lib/browserStorage';
export const DEFAULT_NOTIFICATION_CONFIGS: NotificationConfigs = {
  telegram: { botToken: '', chatId: '', enabled: false },
  discord: { webhookUrl: '', enabled: false },
  webhook: { url: '', enabled: false },
  pushover: { userKey: '', apiToken: '', enabled: false },
};
export function useNotificationConfigs() {
  const [configs, setConfigs] = useState(() => readJson('host_notification_configs', DEFAULT_NOTIFICATION_CONFIGS));
  useEffect(() => writeJson('host_notification_configs', configs), [configs]);
  return [configs, setConfigs] as const;
}
