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

function bindForm(form, modal) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const spinner = createStatusSpinner();
    form.insertAdjacentElement("afterend", spinner);

    const data = Object.fromEntries(new FormData(form).entries());
    const payload = JSON.stringify(data);

    postData(API_URL, payload)
      .then(() => {
        modal.showStatus(messages.success);
      })
      .catch(() => {
        modal.showStatus(messages.failure);
      })
      .finally(() => {
        spinner.remove();
        form.reset();
      });
  });
}

export function initForms(modal) {
  document.querySelectorAll("form").forEach((form) => {
    bindForm(form, modal);
  });
}
