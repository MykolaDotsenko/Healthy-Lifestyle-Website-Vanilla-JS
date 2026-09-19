const AUTO_OPEN_DELAY_MS = 300_000;

export function initModal() {
  const modal = document.querySelector(".modal");
  const triggers = document.querySelectorAll("[data-modal]");

  if (!modal) {
    return {
      open() {},
      close() {},
    };
  }

  let autoOpenTimerId = window.setTimeout(open, AUTO_OPEN_DELAY_MS);

  function close() {
    modal.classList.add("hide");
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  function open() {
    modal.classList.add("show");
    modal.classList.remove("hide");
    document.body.style.overflow = "hidden";

    if (autoOpenTimerId) {
      window.clearTimeout(autoOpenTimerId);
      autoOpenTimerId = null;
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", open);
  });

  modal.addEventListener("click", (event) => {
    const target = event.target;

    if (target === modal || target.closest?.("[data-close]")) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      close();
    }
  });

  function openAtPageEnd() {
    const reachedBottom =
      window.scrollY + document.documentElement.clientHeight >=
      document.documentElement.scrollHeight;

    if (!reachedBottom) {
      return;
    }

    open();
    window.removeEventListener("scroll", openAtPageEnd);
  }

  window.addEventListener("scroll", openAtPageEnd, { passive: true });

  return { open, close };
}
