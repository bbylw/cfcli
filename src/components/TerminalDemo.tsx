import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { CopyIcon, CheckIcon, ArrowClockwiseIcon, TerminalWindowIcon } from "@phosphor-icons/react";
import { tokenizeJsonLine } from "../lib/json-tokens";
import type { TokenKind } from "../lib/json-tokens";

type Tone = "muted" | "ok" | "accent";

type Line =
  | { k: "cmd"; v: string }
  | { k: "out"; v: string; tone?: Tone }
  | { k: "json"; v: string }
  | { k: "gap" };

interface Scene {
  id: string;
  label: string;
  lines: Line[];
}

const SCENES: Scene[] = [
  {
    id: "find",
    label: "找到命令",
    lines: [
      { k: "cmd", v: 'cf cli search "create D1 database"' },
      { k: "json", v: "[" },
      { k: "json", v: "  {" },
      { k: "json", v: '    "command": "cf d1 create",' },
      { k: "json", v: '    "summary": "Create D1 Database"' },
      { k: "json", v: "  }," },
      { k: "json", v: "  {" },
      { k: "json", v: '    "command": "cf d1 update",' },
      { k: "json", v: '    "summary": "Update D1 Database"' },
      { k: "json", v: "  }" },
      { k: "json", v: "]" },
      { k: "gap" },
      { k: "out", v: "搜索在本地运行，不需要登录，最多返回五条最匹配的命令。", tone: "muted" },
    ],
  },
  {
    id: "deploy",
    label: "部署 Worker",
    lines: [
      { k: "cmd", v: "cf init my-worker" },
      { k: "out", v: "已创建 my-worker，并安装依赖", tone: "muted" },
      { k: "out", v: "✓ src/index.ts", tone: "ok" },
      { k: "out", v: "✓ cloudflare.config.ts", tone: "ok" },
      { k: "out", v: "✓ vite.config.ts", tone: "ok" },
      { k: "gap" },
      { k: "cmd", v: "cf deploy" },
      { k: "out", v: "使用 Vite 构建 my-worker ...", tone: "muted" },
      { k: "out", v: "校验 .cloudflare/output/v0/", tone: "muted" },
      { k: "out", v: "https://my-worker.<account>.workers.dev", tone: "accent" },
    ],
  },
  {
    id: "migrate",
    label: "从 Wrangler 迁移",
    lines: [
      { k: "cmd", v: "cf migrate" },
      { k: "out", v: "将更新 4 个文件：", tone: "muted" },
      { k: "out", v: "├─ cloudflare.config.ts", tone: "muted" },
      { k: "out", v: "├─ wrangler.config.ts", tone: "muted" },
      { k: "out", v: "└─ package.json", tone: "muted" },
      { k: "gap" },
      { k: "out", v: "需人工处理：", tone: "muted" },
      { k: "out", v: "└─ [required] Durable Object 绑定需迁移后复核", tone: "ok" },
      { k: "out", v: "在 cloudflare.config.ts 中处理 TODO(@cloudflare) 后再构建。", tone: "muted" },
    ],
  },
];

const TOKEN_CLASS: Record<TokenKind, string> = {
  key: "text-fog-300",
  colon: "text-fog-600",
  string: "text-ember-400",
  bool: "text-ember-500",
  number: "text-fog-100",
  plain: "",
};

function JsonLine({ text }: { text: string }) {
  return (
    <>
      {tokenizeJsonLine(text).map((token, index) => (
        <span key={index} className={TOKEN_CLASS[token.kind]}>
          {token.value}
        </span>
      ))}
    </>
  );
}

const TONE: Record<Tone, string> = {
  muted: "text-fog-500",
  ok: "text-ember-400",
  accent: "text-fog-100 underline decoration-ember-500/40 underline-offset-4",
};

export default function TerminalDemo() {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [partial, setPartial] = useState("");
  const [copied, setCopied] = useState(false);

  const scene = SCENES[active];
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const firstCommand = useMemo(
    () => scene.lines.find((line) => line.k === "cmd") as { v: string } | undefined,
    [scene],
  );

  // 离开视口时暂停，回到视口继续播放
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.02,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 场景切换时重置播放
  useEffect(() => {
    setShown(0);
    setPartial("");
    setCopied(false);
  }, [active]);

  // 播放驱动：逐字键入命令，整体揭示输出
  useEffect(() => {
    if (reduced) {
      setShown(scene.lines.length);
      setPartial("");
      return;
    }

    // 离开视口则挂起，回到视口后从这里继续
    if (!inView) return;

    const line = scene.lines[shown];
    if (!line) return;

    if (line.k === "cmd") {
      if (partial.length < line.v.length) {
        const id = window.setTimeout(
          () => setPartial(line.v.slice(0, partial.length + 1)),
          24,
        );
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => {
        setShown((n) => n + 1);
        setPartial("");
      }, 460);
      return () => window.clearTimeout(id);
    }

    const delay =
      line.k === "gap" ? 140 : line.k === "json" ? 90 : Math.min(line.v.length, 26) * 16 + 160;
    const id = window.setTimeout(() => setShown((n) => n + 1), delay);
    return () => window.clearTimeout(id);
  }, [shown, partial, scene, reduced, inView]);

  // 自动滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, partial]);

  const done = shown >= scene.lines.length;

  // roving tabindex：方向键在场景之间移动并立即切换
  const onSceneKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      let next: number | undefined;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = (active + 1) % SCENES.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = (active - 1 + SCENES.length) % SCENES.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = SCENES.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      setActive(next);
      // 焦点跟随选中项
      const group = event.currentTarget.parentElement;
      group?.querySelector<HTMLButtonElement>(`[data-scene-index="${next}"]`)?.focus();
    },
    [active],
  );

  const replay = useCallback(() => {
    setShown(0);
    setPartial("");
  }, []);

  const copy = useCallback(async () => {
    if (!firstCommand) return;
    try {
      await navigator.clipboard.writeText(firstCommand.v);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [firstCommand]);

  return (
    <div
      ref={containerRef}
      className="panel min-w-0 overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-ink-850/60 px-3 py-2.5">
        <div className="flex items-center gap-2 text-fog-500">
          <TerminalWindowIcon size={16} weight="bold" />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]">终端</span>
        </div>
        <div className="flex items-center gap-1.5">
          {done && !reduced && (
            <button
              type="button"
              onClick={replay}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[11px] text-fog-500 transition-colors hover:bg-ink-800 hover:text-fog-100"
            >
              <ArrowClockwiseIcon size={13} weight="bold" />
              重放
            </button>
          )}
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[11px] text-fog-500 transition-colors hover:bg-ink-800 hover:text-fog-100"
            aria-label="复制当前命令"
          >
            {copied ? <CheckIcon size={13} weight="bold" /> : <CopyIcon size={13} weight="bold" />}
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>

      <div
        className="flex gap-1 overflow-x-auto border-b border-line bg-ink-900/40 px-2 py-2"
        role="radiogroup"
        aria-label="终端场景"
      >
        {SCENES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={index === active}
            tabIndex={index === active ? 0 : -1}
            data-scene-index={index}
            onClick={() => setActive(index)}
            onKeyDown={onSceneKeyDown}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-mono text-[12px] transition-colors duration-200 ${
              index === active
                ? "bg-ink-800 text-fog-100"
                : "text-fog-600 hover:text-fog-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="h-[356px] overflow-y-auto bg-ink-950/70 px-4 py-4 font-mono text-[12.5px] leading-[1.85] md:px-5"
        aria-hidden="true"
      >
        <TerminalBody scene={scene} shown={shown} partial={partial} />
      </div>

      <p className="sr-only">
        {scene.lines.map((line, index) =>
          line.k === "gap" ? null : (
            <span key={`sr-${index}`}>
              {line.k === "cmd" ? `$ ${line.v}` : line.v}{" "}
            </span>
          ),
        )}
      </p>

      <div className="flex items-center justify-between border-t border-line bg-ink-850/40 px-4 py-2">
        <span className="font-mono text-[11px] text-fog-600">
          {done ? "就绪" : updatedLabel(scene, shown)}
        </span>
        <span
          className="font-mono text-[11px] text-fog-600 tabular-nums"
          aria-hidden="true"
        >
          {SCENES.findIndex((s) => s.id === scene.id) + 1} / {SCENES.length}
        </span>
      </div>
    </div>
  );
}

function updatedLabel(scene: Scene, shown: number) {
  const line = scene.lines[shown];
  if (!line) return "就绪";
  return line.k === "cmd" ? "执行中" : "输出中";
}

function TerminalBody({
  scene,
  shown,
  partial,
}: {
  scene: Scene;
  shown: number;
  partial: string;
}) {
  const lines = scene.lines.slice(0, shown);
  const current = scene.lines[shown];

  return (
    <div>
      {lines.map((line, index) => (
        <TerminalLine key={`${scene.id}-${index}`} line={line} />
      ))}

      {current?.k === "cmd" && (
        <div className="flex gap-2">
          <span className="select-none text-ember-500">$</span>
          <span className="text-fog-100">
            {partial}
            <span className="caret ml-0.5" aria-hidden="true" />
          </span>
        </div>
      )}
    </div>
  );
}

function TerminalLine({ line }: { line: Line }) {
  if (line.k === "gap") return <div className="h-3" aria-hidden="true" />;

  if (line.k === "cmd") {
    return (
      <div className="flex gap-2">
        <span className="select-none text-ember-500">$</span>
        <span className="text-fog-100">{line.v}</span>
      </div>
    );
  }

  if (line.k === "json") {
    return (
      <div className="whitespace-pre text-fog-500">
        <JsonLine text={line.v} />
      </div>
    );
  }

  return (
    <div className={line.tone ? TONE[line.tone] : "text-fog-300"}>{line.v}</div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
