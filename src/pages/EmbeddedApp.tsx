
import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { ResearchPageLayout } from '../components/sections/ResearchPageLayout';

export const EmbeddedApp = () => {
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  useEffect(() => {
    const sdk = new DiscordSDK('');
    let mounted = true;
    const doAuthenticate = async () => {
      try {
        await sdk.ready();
        const result = await sdk.commands.authenticate();
        const code = (result as any)?.code as string | undefined;
        if (!code) {
          if (mounted) setAuthStatus('no_code');
          return;
        }

        const resp = await fetch('/api/auth/sdk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (resp.ok) {
          if (mounted) setAuthStatus('ok');
        } else {
          const body = await resp.json().catch(() => null);
          if (mounted) setAuthStatus(body?.error || 'error');
        }
      } catch (err) {
        console.error('EmbeddedApp auth error', err);
        if (mounted) setAuthStatus('error');
      }
    };

    doAuthenticate();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <ResearchPageLayout presetKey="embedded" />
      {authStatus === 'ok' && <div style={{ display: 'none' }} />}
      {authStatus && authStatus !== 'ok' && (
        <div style={{ position: 'fixed', bottom: 8, left: 8, background: '#fee', padding: 8 }}>
          Auth status: {authStatus}
        </div>
      )}
    </>
  );
};



