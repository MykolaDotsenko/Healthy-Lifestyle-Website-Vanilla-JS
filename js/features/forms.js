const API_URL = "http://localhost:3000/requests";

const messages = {
  loading: "img/form/spinner.svg",
  success: "Thank you! We will contact you soon.",
  failure: "Something went wrong...",
};

async function postData(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  return response.json();
}

function createStatusSpinner() {
  const spinner = document.createElement("img");
  spinner.src = messages.loading;
  spinner.alt = "Submitting";
  spinner.style.display = "block";
  spinner.style.margin = "0 auto";
  return spinner;
}

function showThanksModal(message, modal) {
  const previousDialog = document.querySelector(".modal__dialog");
  const modalRoot = document.querySelector(".modal");

  if (!previousDialog || !modalRoot) {
    return;
  }

  previousDialog.classList.add("hide");
  modal.open();

  const dialog = document.createElement("div");
  dialog.className = "modal__dialog";

  const content = document.createElement("div");
  content.className = "modal__content";

  const closeButton = document.createElement("button");
  closeButton.className = "modal__close";
  closeButton.type = "button";
  closeButton.dataset.close = "";
  closeButton.setAttribute("aria-label", "Close message");
  closeButton.textContent = "×";

  const status = document.createElement("p");
  status.className = "modal__title";
  status.setAttribute("role", "status");
  status.textContent = message;

  content.append(closeButton, status);
  dialog.append(content);
  modalRoot.append(dialog);

  window.setTimeout(() => {
    dialog.remove();
    previousDialog.classList.add("show");
    previousDialog.classList.remove("hide");
    modal.close();
  }, 4000);
}

function bindForm(form, modal) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const spinner = createStatusSpinner();
    form.insertAdjacentElement("afterend", spinner);

    const data = Object.fromEntries(new FormData(form).entries());
    const payload = JSON.stringify(data);

    postData(API_URL, payload)
      .then(() => {
        showThanksModal(messages.success, modal);
        spinner.remove();
      })
      .catch(() => {
        showThanksModal(messages.failure, modal);
      })
      .finally(() => {
        form.reset();
      });
  });
}

export function initForms(modal) {
  document.querySelectorAll("form").forEach((form) => {
    bindForm(form, modal);
  });
}
