export interface RelativeTimeFormat {
  key: string;
  count?: number;
}

export const formatRelativeTime = (
  date: Date,
  now: Date = new Date(),
): RelativeTimeFormat => {
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.round(diffMs / 1000));

  if (diffSec < 5) return { key: 'relativeTime.justNow' };
  if (diffSec < 60) return { key: 'relativeTime.secondsAgo', count: diffSec };

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return { key: 'relativeTime.minutesAgo', count: diffMin };

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return { key: 'relativeTime.hoursAgo', count: diffHours };

  const diffDays = Math.floor(diffHours / 24);
  return { key: 'relativeTime.daysAgo', count: diffDays };
};

export const formatClock = (date: Date): string =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
