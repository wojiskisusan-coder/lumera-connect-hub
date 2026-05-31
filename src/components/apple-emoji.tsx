import emojiData from "react-apple-emojis/src/data.json";
import { useMemo, type ReactNode } from "react";

type EmojiItem = { name: string; emoji: string; url: string };
const byEmoji: Map<string, EmojiItem> = new Map(
  (emojiData as EmojiItem[]).map((d) => [d.emoji, d])
);

/** Render a single emoji as an Apple emoji image. Falls back to native glyph. */
export function AE({ emoji, size = 18, className = "" }: { emoji: string; size?: number; className?: string }) {
  const item = byEmoji.get(emoji);
  if (!item) return <span className={className}>{emoji}</span>;
  return (
    <img
      src={item.url}
      alt={item.name}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      className={`inline-block align-[-0.18em] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Matches any extended pictographic + optional variation selectors + ZWJ sequences.
// Keep tolerant — false positives just render natively.
const EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?)*)/gu;

/** Replace every emoji glyph in a string with an Apple emoji image. */
export function EmojiText({
  children,
  size = 18,
  className = "",
}: {
  children: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const parts: ReactNode[] = useMemo(() => {
    if (!children) return [];
    const segments = children.split(EMOJI_RE);
    return segments.map((seg, i) => {
      if (!seg) return null;
      if (byEmoji.has(seg)) return <AE key={i} emoji={seg} size={size} />;
      // Some sequences (ZWJ) may not match directly — try first char
      const first = [...seg][0];
      if (first && byEmoji.has(first) && [...seg].length === 1) {
        return <AE key={i} emoji={first} size={size} />;
      }
      return <span key={i}>{seg}</span>;
    });
  }, [children, size]);
  return <span className={className}>{parts}</span>;
}