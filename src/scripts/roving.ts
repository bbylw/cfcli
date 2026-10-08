/**
 * 让一组 tab / radio 按钮符合 WAI-ARIA 的 roving tabindex 模式：
 * 组内只有当前项可 Tab 进入，其余用方向键移动。
 *
 * ARIA 规范要求 tablist 支持方向键导航，且 tab 面板本身不应进入 Tab 序列。
 * 见 https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
export function initRovingGroups(root: ParentNode = document) {
  for (const group of root.querySelectorAll<HTMLElement>('[role="tablist"], [role="radiogroup"]')) {
    const items = Array.from(
      group.querySelectorAll<HTMLElement>('[role="tab"], [role="radio"]'),
    );
    if (items.length === 0) continue;

    const focusAt = (index: number) => {
      const target = items[index];
      if (!target) return;
      for (const item of items) item.tabIndex = item === target ? 0 : -1;
      target.focus();
      target.click();
    };

    // 初始时只有选中项可 Tab 进入；用户手动聚焦某项后跟随该项。
    const syncTabIndex = () => {
      const focused = items.find((item) => item === document.activeElement);
      const active = focused ?? items.find((item) => item.getAttribute("aria-selected") === "true")
        ?? items.find((item) => item.getAttribute("aria-checked") === "true")
        ?? items[0]!;
      for (const item of items) item.tabIndex = item === active ? 0 : -1;
    };

    syncTabIndex();

    group.addEventListener("keydown", (event) => {
      const current = items.findIndex((item) => item === document.activeElement);
      if (current === -1) return;

      let next: number | undefined;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = (current + 1) % items.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = (current - 1 + items.length) % items.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = items.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      focusAt(next);
    });

    group.addEventListener("focusin", syncTabIndex);
  }
}