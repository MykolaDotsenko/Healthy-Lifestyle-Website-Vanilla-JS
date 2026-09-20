const ACTIVE_CLASS = "tabheader__item_active";

export function initTabs({ onChange = () => {} } = {}) {
  const tabList = document.querySelector('[role="tablist"]');
  const tabs = [...document.querySelectorAll('[role="tab"]')];

  if (!tabList || !tabs.length) {
    return;
  }

  const panels = tabs.map((tab) =>
    document.getElementById(tab.getAttribute("aria-controls")),
  );

  if (panels.some((panel) => !panel)) {
    return;
  }

  function activateTab(activeIndex, { focus = false } = {}) {
    tabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      tab.classList.toggle(ACTIVE_CLASS, isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;

      const panel = panels[index];
      panel.hidden = !isActive;
      panel.classList.toggle("hide", !isActive);
      panel.classList.toggle("show", isActive);
      panel.classList.toggle("fade", isActive);
    });

    const activeTab = tabs[activeIndex];
    onChange(activeTab.dataset.approachId ?? "");

    if (focus) {
      activeTab.focus();
    }
  }

  function moveFocus(currentIndex, delta) {
    const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
    activateTab(nextIndex, { focus: true });
  }

  tabList.addEventListener("click", (event) => {
    const target = event.target.closest?.('[role="tab"]');

    if (!target || !tabList.contains(target)) {
      return;
    }

    const index = tabs.indexOf(target);
    if (index >= 0) {
      activateTab(index);
    }
  });

  tabList.addEventListener("keydown", (event) => {
    const currentIndex = tabs.indexOf(document.activeElement);

    if (currentIndex < 0) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        moveFocus(currentIndex, -1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocus(currentIndex, 1);
        break;
      case "Home":
        event.preventDefault();
        activateTab(0, { focus: true });
        break;
      case "End":
        event.preventDefault();
        activateTab(tabs.length - 1, { focus: true });
        break;
    }
  });

  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"),
  );
  activateTab(selectedIndex);
}
