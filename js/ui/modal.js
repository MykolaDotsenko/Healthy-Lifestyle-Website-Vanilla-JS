export function initModal() {
  const dialog = document.querySelector("#contact-dialog");

  if (!(dialog instanceof HTMLDialogElement)) {
    return {
      open() {},
      close() {},
    };
  }

  const initialFocus = dialog.querySelector("[data-dialog-initial-focus]");
  let returnFocusTarget = null;

  function open() {
    if (dialog.open) {
      return;
    }

    returnFocusTarget =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    dialog.showModal();
    initialFocus?.focus();
  }

  function close() {
    if (dialog.open) {
      dialog.close();
    }
  }

  dialog.addEventListener("click", (event) => {
    const target = event.target;

    if (target === dialog || target.closest?.("[data-close]")) {
      close();
    }
  });

  dialog.addEventListener("close", () => {
    if (returnFocusTarget?.isConnected) {
      returnFocusTarget.focus();
    }
    returnFocusTarget = null;
  });

  return { open, close };
}
