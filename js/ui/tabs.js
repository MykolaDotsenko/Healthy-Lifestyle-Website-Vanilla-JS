const ACTIVE_CLASS = "tabheader__item_active";

export function initTabs() {
  const tabs = [...document.querySelectorAll(".tabheader__item")];
  const panels = [...document.querySelectorAll(".tabcontent")];
  const tabList = document.querySelector(".tabheader__items");

  if (!tabs.length || tabs.length !== panels.length || !tabList) {
    return;
  }

  function setActiveTab(activeIndex) {
    panels.forEach((panel, index) => {
      const isActive = index === activeIndex;
      panel.hidden = !isActive;
      panel.classList.toggle("hide", !isActive);
      panel.classList.toggle("show", isActive);
      panel.classList.toggle("fade", isActive);
    });

    tabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      tab.classList.toggle(ACTIVE_CLASS, isActive);
      tab.setAttribute("aria-expanded", String(isActive));
    });
  }

  tabList.addEventListener("click", (event) => {
    const target = event.target.closest?.(".tabheader__item");

    if (!target || !tabList.contains(target)) {
      return;
    }

    const index = tabs.indexOf(target);
    if (index >= 0) {
      setActiveTab(index);
    }
  });

  setActiveTab(0);
}
