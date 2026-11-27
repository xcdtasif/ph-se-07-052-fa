import { cn } from "@/lib/utils"

/*
A line of text that's still loading: exactly one line tall for the text size it's given
(or inherits), with a bar inside, so the real text takes its place without moving
anything. Size it like the text it stands in for, e.g. "w-32 text-sm".
*/
export function SkeletonText({ className }: { className?: string }) {
  return (
    <span className={cn("flex h-lh items-center", className)}>
      <span className="skeleton h-[0.75em] w-full rounded-sm" />
    </span>
  )
}
