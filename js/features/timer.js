const REFRESH_WEEKDAY = 1; // Monday
const REFRESH_HOUR = 9;

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

function padTime(value) {
  return String(value).padStart(2, "0");
}

function formatDeadline(deadline) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(deadline);
}

export function initTimer({
  selector = ".timer",
  getDeadline = getNextWeeklyDeadline,
} = {}) {
  const timer = document.querySelector(selector);

  if (!timer) {
    return () => {};
  }

  const fields = {
    days: timer.querySelector('[data-timer-part="days"]'),
    hours: timer.querySelector('[data-timer-part="hours"]'),
    minutes: timer.querySelector('[data-timer-part="minutes"]'),
    seconds: timer.querySelector('[data-timer-part="seconds"]'),
  };
  const deadlineOutput = document.querySelector("[data-timer-deadline]");

  if (Object.values(fields).some((field) => !field)) {
    return () => {};
  }

  let deadline = getDeadline(new Date());

  function renderDeadline() {
    if (!deadlineOutput) {
      return;
    }

    deadlineOutput.dateTime = deadline.toISOString();
    deadlineOutput.textContent = formatDeadline(deadline);
  }

  function updateClock() {
    let remaining = getTimeRemaining(deadline);

    if (remaining.total <= 0) {
      deadline = getDeadline(new Date());
      remaining = getTimeRemaining(deadline);
      renderDeadline();
    }

    fields.days.textContent = padTime(remaining.days);
    fields.hours.textContent = padTime(remaining.hours);
    fields.minutes.textContent = padTime(remaining.minutes);
    fields.seconds.textContent = padTime(remaining.seconds);
  }

  renderDeadline();
  updateClock();

  const intervalId = window.setInterval(updateClock, 1_000);

  return () => window.clearInterval(intervalId);
}
