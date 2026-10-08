import type { ReactNode } from "react";
import { InfoIcon, WarningIcon, LightbulbIcon } from "@phosphor-icons/react";

type Variant = "note" | "warn" | "tip";

const VARIANTS: Record<
  Variant,
  { icon: typeof InfoIcon; label: string; ring: string; text: string }
> = {
  note: {
    icon: InfoIcon,
    label: "说明",
    ring: "border-line bg-ink-900",
    text: "text-fog-300",
  },
  warn: {
    icon: WarningIcon,
    label: "注意",
    ring: "border-ember-500/30 bg-ember-500/8",
    text: "text-fog-300",
  },
  tip: {
    icon: LightbulbIcon,
    label: "提示",
    ring: "border-line bg-ink-900",
    text: "text-fog-300",
  },
};

export default function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <aside className={`callout rounded-[16px] border p-4 ${config.ring}`}>
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          weight="bold"
          aria-hidden
          className={variant === "warn" ? "text-ember-500" : "text-fog-500"}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fog-500">
          {title ?? config.label}
        </span>
      </div>
      <div className={`mt-3 grid gap-3 text-[14px] leading-relaxed ${config.text}`}>
        {children}
      </div>
    </aside>
  );
}
