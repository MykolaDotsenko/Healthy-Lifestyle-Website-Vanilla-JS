function toPixels(value) {
  return +value.replace(/\D/g, "");
}

function formatSlideNumber(value, total) {
  return total < 10 ? `0${value}` : String(value);
}

export function initCarousel() {
  const slides = [...document.querySelectorAll(".offer__slide")];
  const slider = document.querySelector(".offer__slider");
  const previousButton = document.querySelector(".offer__slider-prev");
  const nextButton = document.querySelector(".offer__slider-next");
  const total = document.querySelector("#total");
  const current = document.querySelector("#current");
  const wrapper = document.querySelector(".offer__slider-wrapper");
  const track = document.querySelector(".offer__slider-inner");

  if (
    !slides.length ||
    !slider ||
    !previousButton ||
    !nextButton ||
    !total ||
    !current ||
    !wrapper ||
    !track
  ) {
    return;
  }

  let offset = 0;
  let slideIndex = 1;
  const width = window.getComputedStyle(wrapper).width;
  const slideWidth = toPixels(width);

  total.textContent = formatSlideNumber(slides.length, slides.length);
  current.textContent = formatSlideNumber(slideIndex, slides.length);

  track.style.width = `${100 * slides.length}%`;
  track.style.display = "flex";
  track.style.transition = "0.5s all";
  wrapper.style.overflow = "hidden";

  slides.forEach((slide) => {
    slide.style.width = width;
  });

  slider.style.position = "relative";

  const indicators = document.createElement("div");
  indicators.className = "carousel-indicators";
  indicators.setAttribute("role", "group");
  indicators.setAttribute("aria-label", "Choose slide");
  indicators.style.cssText = [
    "position:absolute",
    "right:0",
    "bottom:0",
    "left:0",
    "z-index:15",
    "display:flex",
    "justify-content:center",
    "margin-right:15%",
    "margin-left:15%",
  ].join(";");

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.dataset.slideTo = String(index + 1);
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.setAttribute("aria-pressed", String(index === 0));
    dot.style.cssText = [
      "padding:0",
      "border-right:0",
      "border-left:0",
      "box-sizing:content-box",
      "flex:0 1 auto",
      "width:30px",
      "height:6px",
      "margin-right:3px",
      "margin-left:3px",
      "cursor:pointer",
      "background-color:#fff",
      "background-clip:padding-box",
      "border-top:10px solid transparent",
      "border-bottom:10px solid transparent",
      `opacity:${index === 0 ? 1 : 0.5}`,
      "transition:opacity .6s ease",
    ].join(";");

    indicators.append(dot);
    return dot;
  });

  slider.append(indicators);

  function render() {
    track.style.transform = `translateX(-${offset}px)`;
    current.textContent = formatSlideNumber(slideIndex, slides.length);

    dots.forEach((dot, index) => {
      const isActive = index === slideIndex - 1;
      dot.style.opacity = isActive ? "1" : ".5";
      dot.setAttribute("aria-pressed", String(isActive));
    });
  }

  nextButton.addEventListener("click", () => {
    if (offset === slideWidth * (slides.length - 1)) {
      offset = 0;
    } else {
      offset += slideWidth;
    }

    slideIndex = slideIndex === slides.length ? 1 : slideIndex + 1;
    render();
  });

  previousButton.addEventListener("click", () => {
    if (offset === 0) {
      offset = slideWidth * (slides.length - 1);
    } else {
      offset -= slideWidth;
    }

    slideIndex = slideIndex === 1 ? slides.length : slideIndex - 1;
    render();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.slideTo);
      slideIndex = targetIndex;
      offset = slideWidth * (targetIndex - 1);
      render();
    });
  });
}
