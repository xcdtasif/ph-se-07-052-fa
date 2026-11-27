// The dot under the current item in a row
export function ActiveDot() {
  return (
    <span
      className="bg-foreground absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full"
      aria-hidden="true"
    />
  )
}
