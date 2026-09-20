function formatSlideNumber(value, total) {
  return total < 10 ? `0${value}` : String(value);
}

export function initCarousel() {
  const slider = document.querySelector(".offer__slider");
  const track = document.querySelector(".offer__slider-inner");
  const slides = [...document.querySelectorAll(".offer__slide")];
  const previousButton = document.querySelector(".offer__slider-prev");
  const nextButton = document.querySelector(".offer__slider-next");
  const current = document.querySelector("#current");
  const total = document.querySelector("#total");
  const status = slider?.querySelector("[data-carousel-status]");

  if (
    !slider ||
    !track ||
    !slides.length ||
    !previousButton ||
    !nextButton ||
    !current ||
    !total
  ) {
    return;
  }

  let activeIndex = 0;

  total.textContent = formatSlideNumber(slides.length, slides.length);

  const indicators = document.createElement("div");
  indicators.className = "carousel-indicators";
  indicators.setAttribute("role", "group");
  indicators.setAttribute("aria-label", "Choose slide");

  const dots = slides.map((slide, index) => {
    const title =
      slide.querySelector(".offer__slide-caption strong")?.textContent?.trim() ||
      `Slide ${index + 1}`;

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-indicator";
    dot.dataset.slideTo = String(index);
    dot.setAttribute(
      "aria-label",
      `Show ${title}, slide ${index + 1} of ${slides.length}`,
    );
    indicators.append(dot);

    return dot;
  });

  slider.append(indicators);

  function render() {
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    current.textContent = formatSlideNumber(activeIndex + 1, slides.length);

    slides.forEach((slide, index) => {
      if (index === activeIndex) {
        slide.removeAttribute("aria-hidden");
      } else {
        slide.setAttribute("aria-hidden", "true");
      }
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.setAttribute("aria-current", isActive ? "true" : "false");
      dot.setAttribute("aria-disabled", isActive ? "true" : "false");
    });

    if (status) {
      const title =
        slides[activeIndex]
          .querySelector(".offer__slide-caption strong")
          ?.textContent?.trim() || "";
      const description = title ? `: ${title}` : "";
      status.textContent =
        `Slide ${activeIndex + 1} of ${slides.length}${description}`;
    }
  }

  function setActiveIndex(index) {
    activeIndex = (index + slides.length) % slides.length;
    render();
  }

  previousButton.addEventListener("click", () => {
    setActiveIndex(activeIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    setActiveIndex(activeIndex + 1);
  });

  indicators.addEventListener("click", (event) => {
    const target = event.target.closest?.(".carousel-indicator");

    if (!target || !indicators.contains(target)) {
      return;
    }

    setActiveIndex(Number(target.dataset.slideTo));
  });

  render();
}
