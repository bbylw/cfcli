export type TokenKind = "key" | "colon" | "string" | "bool" | "number" | "plain";

export interface Token {
  kind: TokenKind;
  value: string;
}

/**
 * 把一行 JSON 文本切成带语义分类的 token，用于终端的语法着色。
 *
 * 纯函数，不依赖 React，方便单测。
 */
const TOKEN_RE = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

export function tokenizeJsonLine(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  // 正则带 g 标志，复用前必须重置游标
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ kind: "plain", value: text.slice(last, match.index) });
    }

    const [full, str, colon, bool, num] = match;

    if (str !== undefined) {
      if (colon) {
        tokens.push({ kind: "key", value: str });
        tokens.push({ kind: "colon", value: colon });
      } else {
        tokens.push({ kind: "string", value: str });
      }
    } else if (bool) {
      tokens.push({ kind: "bool", value: bool });
    } else if (num) {
      tokens.push({ kind: "number", value: num });
    }

    last = match.index + full.length;
  }

  if (last < text.length) {
    tokens.push({ kind: "plain", value: text.slice(last) });
  }

  return tokens;
}