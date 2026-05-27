(() => {
  const payload = window.__AI_PULSE_STATIC_SNAPSHOT__;
  if (!payload || !payload.snapshots) return;
  const originalFetch = window.fetch.bind(window);
  const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
  window.fetch = (input, init) => {
    const rawUrl = typeof input === 'string' ? input : input && input.url;
    if (rawUrl) {
      try {
        const url = new URL(rawUrl, window.location.href);
        if (url.pathname.endsWith('/api/pipeline/snapshot')) {
          const persona = url.searchParams.get('persona') || 'investor';
          const language = url.searchParams.get('language') || 'zh';
          const snapshot = payload.snapshots[persona + '-' + language];
          if (snapshot) return Promise.resolve(jsonResponse(snapshot));
        }
        if (url.pathname.endsWith('/api/pipeline/status')) {
          return Promise.resolve(jsonResponse({
            today: payload.date,
            database: 'static',
            snapshots_available: Object.keys(payload.snapshots).map((key) => {
              const [persona, language] = key.split('-');
              return { persona, language, produced_at: payload.snapshots[key].producedAt || payload.generatedAt };
            }),
            server_time_utc: payload.generatedAt,
          }));
        }
        if (url.pathname.endsWith('/api/messages')) {
          return Promise.resolve(jsonResponse([]));
        }
      } catch {}
    }
    return originalFetch(input, init);
  };
})();
