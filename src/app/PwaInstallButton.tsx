import { useEffect, useMemo, useState } from 'react';
import { AppIcon } from '../shared/components/AppIcon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isStandalone(): boolean {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [showHelp, setShowHelp] = useState(false);

  const isIos = useMemo(
    () => /iphone|ipad|ipod/i.test(navigator.userAgent),
    [],
  );

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <span className="pwa-installed-chip" title="Running as an installed PWA">
        <span />
        App
      </span>
    );
  }

  if (!installPrompt && !isIos) return null;

  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
      return;
    }
    setShowHelp(current => !current);
  };

  return (
    <div className="pwa-install">
      <button className="pwa-install-button" type="button" onClick={() => void install()}>
        <AppIcon name="download" size={15} />
        <span>Install</span>
      </button>
      {showHelp && (
        <div className="pwa-install-popover">
          <strong>Add Host to Home Screen</strong>
          <span>In Safari, tap Share, then choose “Add to Home Screen”.</span>
        </div>
      )}
    </div>
  );
}
