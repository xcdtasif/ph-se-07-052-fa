import { cn } from "@/lib/utils"

type ClippedWordsProps = {
  text: string
  // Inside a link with the `group` class: underline every word while it's hovered
  underline?: boolean
}

/*
Text that ends in "…" after the last whole word that fits, for an element with `truncate`, e.g.
a table cell. Every word after the first is an inline-block, which the "…" hides whole rather
than cutting. The first word stays inline, so a word too long for the space is cut midway
instead of leaving only "…". A word's leading space is a non-breaking one inside it, so no space
is left before the "…". Underlines don't reach into inline-blocks, so each word underlines itself.
*/
export function ClippedWords({ text, underline = false }: ClippedWordsProps) {
  const words = text.trim().split(/\s+/)

  return words.map((word, index) => (
    <span
      key={index}
      className={cn(
        index > 0 && "inline-block",
        underline && "decoration-muted-foreground/60 underline-offset-4 group-hover:underline",
      )}
    >
      {index > 0 ? ` ${word}` : word}
    </span>
  ))
}
