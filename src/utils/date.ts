const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** 2026年9月29日 */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}