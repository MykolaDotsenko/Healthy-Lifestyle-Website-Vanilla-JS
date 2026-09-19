const DEMO_SUCCESS_MESSAGE =
  "Demo request validated locally. Nothing was sent or stored.";

function bindDemoForm(form, modal) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    modal.showStatus(DEMO_SUCCESS_MESSAGE);
    form.reset();
  });
}

export function initForms(modal) {
  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    bindDemoForm(form, modal);
  });
}
