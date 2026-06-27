import { hyphenateSync } from "hyphen/fr";

const ELLIPSIS = "…";
/** Hyphenate a lone word only past this length (avoids "L-/ot"). */
const MIN_HYPHEN_WORD_LENGTH = 8;
/** Min length to optionally hyphenate a lone L1 word into L2. */
const MIN_OPTIONAL_HYPHEN_LENGTH = 12;

export type GridTitleLines = {
  line1: string;
  line2: string;
};

function createMeasurer(container: HTMLElement): {
  measure: HTMLDivElement;
  maxWidth: number;
  cleanup: () => void;
} {
  const style = getComputedStyle(container);
  const maxWidth = container.clientWidth;

  const measure = document.createElement("div");
  measure.style.position = "fixed";
  measure.style.visibility = "hidden";
  measure.style.pointerEvents = "none";
  measure.style.left = "-9999px";
  measure.style.top = "0";
  measure.style.font = style.font;
  measure.style.fontSize = style.fontSize;
  measure.style.fontFamily = style.fontFamily;
  measure.style.fontWeight = style.fontWeight;
  measure.style.lineHeight = style.lineHeight;
  measure.style.letterSpacing = style.letterSpacing;
  measure.style.whiteSpace = "nowrap";

  document.body.appendChild(measure);

  return {
    measure,
    maxWidth,
    cleanup: () => {
      document.body.removeChild(measure);
    },
  };
}

function truncateWithEllipsis(
  text: string,
  fits: (value: string) => boolean,
): string {
  if (!text || fits(text)) return text;

  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = `${text.slice(0, mid).trimEnd()}${ELLIPSIS}`;
    if (fits(candidate)) lo = mid;
    else hi = mid - 1;
  }

  return `${text.slice(0, lo).trimEnd()}${ELLIPSIS}`;
}

function splitWordForLine1(
  word: string,
  fits: (value: string) => boolean,
): { line1: string; rest: string } {
  const parts = hyphenateSync(word).split("\u00AD");

  if (parts.length === 1) {
    if (word.length <= 1) {
      return { line1: word, rest: "" };
    }

    let best = { line1: `${word[0]}-`, rest: word.slice(1) };
    let lo = 1;
    let hi = word.length - 1;
    while (lo <= hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const head = word.slice(0, mid);
      const tail = word.slice(mid);
      if (tail && fits(`${head}-`)) {
        best = { line1: `${head}-`, rest: tail };
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best;
  }

  let best = { line1: `${parts[0]}-`, rest: parts.slice(1).join("") };
  let acc = "";

  for (let i = 0; i < parts.length - 1; i += 1) {
    const next = acc + parts[i];
    if (fits(`${next}-`)) {
      best = { line1: `${next}-`, rest: parts.slice(i + 1).join("") };
      acc = next;
    } else {
      break;
    }
  }

  return best;
}

/** Lone long word on L1 + an L2 exists → hyphenate to push the suffix down
 *  (e.g. "Transforma-" / "tions pavill…"). Skips short words. */
function maybeHyphenateLastWordOnLine1(
  line1: string,
  rest: string,
  fits: (value: string) => boolean,
): { line1: string; rest: string } {
  if (!rest) return { line1, rest };

  const words = line1.split(/\s+/).filter(Boolean);
  if (words.length !== 1) return { line1, rest };

  const lastWord = words[0];
  if (!lastWord || lastWord.length < MIN_OPTIONAL_HYPHEN_LENGTH) {
    return { line1, rest };
  }

  const split = splitWordForLine1(lastWord, fits);
  if (!split.rest || !split.line1.endsWith("-")) {
    return { line1, rest };
  }

  return {
    line1: split.line1,
    rest: [split.rest, rest].filter(Boolean).join(" "),
  };
}

function buildLines(
  line1: string,
  rest: string,
  fits: (value: string) => boolean,
): GridTitleLines {
  return {
    line1,
    line2: truncateWithEllipsis(rest, fits),
  };
}

export function splitGridTitle(
  container: HTMLElement,
  text: string,
): GridTitleLines {
  if (!text || container.clientWidth <= 0) {
    return { line1: text, line2: "" };
  }

  const { measure, maxWidth, cleanup } = createMeasurer(container);
  const fits = (value: string) => {
    measure.textContent = value;
    return measure.scrollWidth <= maxWidth + 1;
  };

  if (fits(text)) {
    cleanup();
    return { line1: text, line2: "" };
  }

  const words = text.split(/\s+/).filter(Boolean);
  const line1Words: string[] = [];
  let wordIndex = 0;

  for (; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];

    if (line1Words.length === 0 && !fits(word)) {
      const split = splitWordForLine1(word, fits);
      const rest = [split.rest, ...words.slice(wordIndex + 1)]
        .filter(Boolean)
        .join(" ");
      const result = buildLines(split.line1, rest, fits);
      cleanup();
      return result;
    }

    const candidate = [...line1Words, word].join(" ");
    if (!fits(candidate)) break;
    line1Words.push(word);
  }

  let line1 = line1Words.join(" ");
  let rest = words.slice(wordIndex).join(" ");

  ({ line1, rest } = maybeHyphenateLastWordOnLine1(line1, rest, fits));

  const result = buildLines(line1, rest, fits);
  cleanup();
  return result;
}
