const DEFAULT_DEADLINE = "2024-03-18";

function getTimeRemaining(endTime) {
  const total = Date.parse(endTime) - Date.now();

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function padTime(value) {
  return value >= 0 && value < 10 ? `0${value}` : String(value);
}

export function initTimer({
  selector = ".timer",
  deadline = DEFAULT_DEADLINE,
} = {}) {
  const timer = document.querySelector(selector);

  if (!timer) {
    return;
  }

  const fields = {
    days: timer.querySelector("#days"),
    hours: timer.querySelector("#hours"),
    minutes: timer.querySelector("#minutes"),
    seconds: timer.querySelector("#seconds"),
  };

  if (Object.values(fields).some((field) => !field)) {
    return;
  }

  let intervalId;

  function updateClock() {
    const remaining = getTimeRemaining(deadline);

    fields.days.textContent = padTime(remaining.days);
    fields.hours.textContent = padTime(remaining.hours);
    fields.minutes.textContent = padTime(remaining.minutes);
    fields.seconds.textContent = padTime(remaining.seconds);

    if (remaining.total <= 0 && intervalId) {
      window.clearInterval(intervalId);
    }
  }

  intervalId = window.setInterval(updateClock, 1000);
  updateClock();
}
