import { useMemo, type ReactNode } from "react";

// Apple-style emoji PNGs from iamcal/emoji-data, served via jsDelivr.
// File naming convention: hex codepoints joined by "-", VS-16 (FE0F) stripped,
// keycap sequences keep "20E3", regional indicators keep both halves.
const CDN = "https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64";

function toCodepoints(emoji: string): string {
  const codes: string[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    // Strip variation selector (FE0F) — Apple files don't include it
    if (cp === 0xfe0f) continue;
    codes.push(cp.toString(16));
  }
  return codes.join("-");
}

/** Render a single emoji glyph as an Apple PNG. Falls back to native text on load error. */
export function AE({ emoji, size = 18, className = "" }: { emoji: string; size?: number; className?: string }) {
  const code = toCodepoints(emoji);
  if (!code) return <span className={className}>{emoji}</span>;
  return (
    <img
      src={`${CDN}/${code}.png`}
      alt={emoji}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      className={`inline-block align-[-0.18em] ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        // Hide broken image; the alt text (native emoji) shows instead
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

// Tolerant match: a base pictographic optionally followed by VS-16, then any
// number of ZWJ-joined sequences (keeps composite emojis like 👨‍👩‍👧 intact).
const EMOJI_RE =
  /(\p{Extended_Pictographic}(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?)*)/gu;

/** Replace every emoji glyph in the text with an Apple-styled image. */
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
    return children.split(EMOJI_RE).map((seg, i) => {
      if (!seg) return null;
      if (EMOJI_RE.test(seg)) {
        EMOJI_RE.lastIndex = 0;
        return <AE key={i} emoji={seg} size={size} />;
      }
      return <span key={i}>{seg}</span>;
    });
  }, [children, size]);
  return <span className={className}>{parts}</span>;
}