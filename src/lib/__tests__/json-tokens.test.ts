import { describe, expect, it } from "vitest";
import { tokenizeJsonLine } from "../json-tokens";

const kinds = (line: string) => tokenizeJsonLine(line).map((t) => t.kind);
const text = (line: string) =>
  tokenizeJsonLine(line)
    .map((t) => t.value)
    .join("");

describe("tokenizeJsonLine", () => {
  it("把字符串识别为键，并单独切出冒号", () => {
    expect(kinds('    "command": "cf d1 create",')).toEqual([
      "plain",
      "key",
      "colon",
      "plain",
      "string",
      "plain",
    ]);
  });

  it("识别布尔值与 null", () => {
    expect(kinds('"a": true, "b": false, "c": null')).toContain("bool");
    const tokens = tokenizeJsonLine('"a": true, "b": false, "c": null');
    expect(tokens.filter((t) => t.kind === "bool").map((t) => t.value)).toEqual([
      "true",
      "false",
      "null",
    ]);
  });

  it("识别整数、负数与小数", () => {
    const tokens = tokenizeJsonLine('"n": -42, "f": 3.14');
    expect(tokens.filter((t) => t.kind === "number").map((t) => t.value)).toEqual([
      "-42",
      "3.14",
    ]);
  });

  it("原样保留转义引号，不会在字符串内部截断", () => {
    const line = '  "summary": "say \\"hi\\""';
    expect(text(line)).toBe(line);
    expect(tokenizeJsonLine(line).filter((t) => t.kind === "string")).toHaveLength(1);
  });

  it("拼接后与原文完全一致", () => {
    const cases = [
      "",
      "[",
      "  },",
      '    "name": "my-worker",',
      "  {",
      "]",
      '{"deep": {"nested": [1, 2, null]}}',
    ];
    for (const line of cases) {
      expect(text(line)).toBe(line);
    }
  });

  it("重复调用结果稳定（正则游标不复用）", () => {
    const line = '  "command": "cf d1 create",';
    const first = tokenizeJsonLine(line);
    const second = tokenizeJsonLine(line);
    expect(second).toEqual(first);
  });
});