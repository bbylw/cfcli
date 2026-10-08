let counter = 0;

/** 每次调用返回递增 id，用于同一页面多次渲染同一 SVG 时的渐变/遮罩 id 去重。 */
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
