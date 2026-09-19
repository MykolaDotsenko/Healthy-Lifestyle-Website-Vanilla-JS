export function initModal() {
  const dialog = document.querySelector("#contact-dialog");
  const triggers = [...document.querySelectorAll("[data-modal]")];

  if (!(dialog instanceof HTMLDialogElement)) {
    return {
      open() {},
      close() {},
      showStatus() {},
    };
  }

  const formView = dialog.querySelector("[data-dialog-form]");
  const statusView = dialog.querySelector("[data-dialog-status]");
  const statusMessage = dialog.querySelector("[data-dialog-status-message]");
  const initialFocus = dialog.querySelector("[data-dialog-initial-focus]");
  let returnFocusTarget = null;

  function showForm() {
    if (formView) {
      formView.hidden = false;
    }
    if (statusView) {
      statusView.hidden = true;
    }
  }

  function open() {
    if (dialog.open) {
      return;
    }

    returnFocusTarget =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    showForm();
    dialog.showModal();
    initialFocus?.focus();
  }

  function close() {
    if (dialog.open) {
      dialog.close();
    }
  }

  function showStatus(message) {
    if (formView) {
      formView.hidden = true;
    }
    if (statusView) {
      statusView.hidden = false;
    }
    if (statusMessage) {
      statusMessage.textContent = message;
    }

    if (!dialog.open) {
      returnFocusTarget =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
    }

    dialog.querySelector("[data-dialog-status] [data-close]")?.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", open);
  });

  dialog.addEventListener("click", (event) => {
    const target = event.target;

    if (target === dialog || target.closest?.("[data-close]")) {
      close();
    }
  });

  dialog.addEventListener("close", () => {
    showForm();

    if (returnFocusTarget?.isConnected) {
      returnFocusTarget.focus();
    }
    returnFocusTarget = null;
  });

  return { open, close, showStatus };
}
