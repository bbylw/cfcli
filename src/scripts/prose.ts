/**
 * 正文（.prose-cf）增强，全部渐进增强：无 JS 时代码块与标题保持原样可用。
 *
 * 1. 代码块右上角加复制按钮（语言来自 shiki 的 data-language）。
 * 2. h2 / h3（MDX 已生成 id）追加悬停可见的锚点链接。
 */
export function initProseEnhancements(root: ParentNode = document) {
  initCodeCopy(root);
  initHeadingAnchors(root);
}

function initCodeCopy(root: ParentNode) {
  const blocks = root.querySelectorAll<HTMLElement>(".prose-cf pre");
  if (blocks.length === 0) return;

  for (const pre of blocks) {
    if (pre.dataset.enhanced === "true") continue;
    pre.dataset.enhanced = "true";

    const code = pre.querySelector("code");
    const language = pre.dataset.language ?? code?.dataset.language ?? "代码";

    const wrapper = document.createElement("div");
    wrapper.className = "prose-codeblock";
    pre.replaceWith(wrapper);
    wrapper.append(pre);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "prose-copy";
    button.setAttribute("aria-label", `复制${language}代码`);
    // Phosphor Copy 图标（bold），与站内其他图标同族，避免手绘 SVG
    button.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216,28H88A12,12,0,0,0,76,40V76H40A12,12,0,0,0,28,88V216a12,12,0,0,0,12,12H168a12,12,0,0,0,12-12V180h36a12,12,0,0,0,12-12V40A12,12,0,0,0,216,28ZM156,204H52V100H156Zm48-48H180V88a12,12,0,0,0-12-12H100V52H204Z"/></svg><span>复制</span>';

    const label = button.querySelector("span");

    button.addEventListener("click", async () => {
      const text = pre.innerText;
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        } else {
          fallbackCopy(text);
        }
        button.dataset.copied = "true";
        if (label) label.textContent = "已复制";
        window.setTimeout(() => {
          button.dataset.copied = "false";
          if (label) label.textContent = "复制";
        }, 1800);
      } catch {
        if (label) label.textContent = "复制失败";
      }
    });

    wrapper.append(button);
  }
}

function fallbackCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

function initHeadingAnchors(root: ParentNode) {
  const headings = root.querySelectorAll<HTMLElement>(
    ".prose-cf h2[id], .prose-cf h3[id]",
  );
  if (headings.length === 0) return;

  for (const heading of headings) {
    if (heading.querySelector(":scope > .prose-anchor")) continue;

    const anchor = document.createElement("a");
    anchor.className = "prose-anchor";
    anchor.href = `#${heading.id}`;
    anchor.setAttribute("aria-label", `链接到本节：${heading.textContent?.trim() ?? ""}`);
    anchor.textContent = "#";
    heading.append(anchor);
  }
}
