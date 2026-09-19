const DEFAULT_SEX = "female";
const DEFAULT_RATIO = 1.375;

export function initCalculator() {
  const result = document.querySelector(".calculating__result span");

  if (!result) {
    return;
  }

  let sex = localStorage.getItem("sex") || DEFAULT_SEX;
  let ratio = Number(localStorage.getItem("ratio") || DEFAULT_RATIO);
  let height;
  let weight;
  let age;

  localStorage.setItem("sex", sex);
  localStorage.setItem("ratio", String(ratio));

  function calculate() {
    if (!sex || !height || !weight || !age || !ratio) {
      result.textContent = "____";
      return;
    }

    const calories =
      sex === "female"
        ? (447.6 + 9.2 * weight + 3.1 * height - 4.3 * age) * ratio
        : (88.36 + 13.4 * weight + 4.8 * height - 5.7 * age) * ratio;

    result.textContent = String(Math.round(calories));
  }

  function restoreRadioState(selector, storedValue) {
    document.querySelectorAll(selector).forEach((input) => {
      input.checked = input.value === String(storedValue);
    });
  }

  function bindRadioGroup(selector, onChange) {
    document.querySelectorAll(selector).forEach((input) => {
      input.addEventListener("change", (event) => {
        if (event.target.checked) {
          onChange(event.target.value);
          calculate();
        }
      });
    });
  }

  restoreRadioState('#gender input[name="sex"]', sex);
  restoreRadioState(
    '.calculating__choose_big input[name="activity"]',
    ratio,
  );

  bindRadioGroup('#gender input[name="sex"]', (value) => {
    sex = value;
    localStorage.setItem("sex", value);
  });

  bindRadioGroup('.calculating__choose_big input[name="activity"]', (value) => {
    ratio = Number(value);
    localStorage.setItem("ratio", value);
  });

  const numericFields = {
    height: (value) => {
      height = value;
    },
    weight: (value) => {
      weight = value;
    },
    age: (value) => {
      age = value;
    },
  };

  Object.entries(numericFields).forEach(([id, assign]) => {
    const input = document.querySelector(`#${id}`);

    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      assign(input.valueAsNumber);
      calculate();
    });
  });

  calculate();
}
