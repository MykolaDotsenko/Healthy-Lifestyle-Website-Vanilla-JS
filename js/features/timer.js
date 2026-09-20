import {
  getNextWeeklyDeadline,
  getTimeRemaining,
} from "../domain/weekly-cycle.js";

export { getNextWeeklyDeadline, getTimeRemaining } from "../domain/weekly-cycle.js";

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
  onRefresh = () => {},
} = {}) {
  const timer = document.querySelector(selector);

  if (!timer) {
    return () => {};
  }

  const fields = {
    days: timer.querySelector('[data-timer-part="days"]'),
    hours: timer.querySelector('[data-timer-part="hours"]'),
    minutes: timer.querySelector('[data-timer-part="minutes"]'),
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
      onRefresh();
    }

    fields.days.textContent = padTime(remaining.days);
    fields.hours.textContent = padTime(remaining.hours);
    fields.minutes.textContent = padTime(remaining.minutes);
  }

  renderDeadline();
  updateClock();

  const intervalId = window.setInterval(updateClock, 15_000);

  return () => window.clearInterval(intervalId);
}
