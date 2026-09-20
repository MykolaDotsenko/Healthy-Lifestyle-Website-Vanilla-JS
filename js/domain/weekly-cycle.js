const REFRESH_WEEKDAY = 1; // Monday
const REFRESH_HOUR = 9;

function startOfLocalDayOrdinal(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

export function getNextWeeklyDeadline(now = new Date()) {
  const target = new Date(now);
  target.setHours(REFRESH_HOUR, 0, 0, 0);

  const daysUntilMonday = (REFRESH_WEEKDAY - now.getDay() + 7) % 7;
  target.setDate(now.getDate() + daysUntilMonday);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  }

  return target;
}

export function getCurrentWeeklyCycleStart(now = new Date()) {
  const start = new Date(now);
  start.setHours(REFRESH_HOUR, 0, 0, 0);

  const daysSinceMonday = (now.getDay() - REFRESH_WEEKDAY + 7) % 7;
  start.setDate(now.getDate() - daysSinceMonday);

  if (start.getTime() > now.getTime()) {
    start.setDate(start.getDate() - 7);
  }

  return start;
}

export function getWeeklyCycleIndex(now = new Date()) {
  const start = getCurrentWeeklyCycleStart(now);
  const dayOrdinal = startOfLocalDayOrdinal(start);

  return Math.floor(dayOrdinal / 7);
}

export function getTimeRemaining(deadline, now = new Date()) {
  const targetTime = deadline instanceof Date ? deadline.getTime() : Date.parse(deadline);
  const total = Math.max(0, targetTime - now.getTime());

  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  };
}
