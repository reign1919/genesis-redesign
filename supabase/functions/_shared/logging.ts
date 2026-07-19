type LogLevel = 'info' | 'warn' | 'error';

const SAFE_DETAIL_KEYS = new Set([
  'code',
  'method',
  'status',
  'stage',
  'transition',
]);

export function safeLog(
  level: LogLevel,
  event: string,
  requestId: string,
  details: Record<string, string | number | boolean> = {},
): void {
  const safeDetails = Object.fromEntries(
    Object.entries(details).filter(([key]) => SAFE_DETAIL_KEYS.has(key)),
  );

  const entry = JSON.stringify({
    level,
    event,
    requestId,
    ...safeDetails,
  });

  if (level === 'error') {
    console.error(entry);
  } else if (level === 'warn') {
    console.warn(entry);
  } else {
    console.info(entry);
  }
}
