import { clearCalculatorPreferences } from "./calculator-storage.js";
import { removePlan } from "./plan-storage.js";

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function clearLocalNourishFlowData(storage) {
  if (!storage) {
    return false;
  }

  const calculatorCleared = clearCalculatorPreferences(storage);
  const planCleared = removePlan(storage);

  return calculatorCleared && planCleared;
}

export function initLocalDataControls({
  storage = getLocalStorage(),
  onCleared = () => {},
} = {}) {
  const button = document.querySelector("[data-clear-local-data]");
  const status = document.querySelector("[data-local-data-status]");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    if (!clearLocalNourishFlowData(storage)) {
      if (status) {
        status.textContent = "This browser could not clear local NourishFlow data.";
      }
      return;
    }

    onCleared();

    if (status) {
      status.textContent =
        "Saved plan and calculator preferences were cleared from this device.";
    }
  });
}
