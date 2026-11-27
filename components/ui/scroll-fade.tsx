"use client"

import { cn } from "cn"
import * as React from "react"

/*
Scrolls sideways with no scrollbar. Each side's 3rem fades out while there's more to scroll
that way, hinting at it; at either end, or with nothing to scroll, that side's fade goes so the
first or last item shows in full.
*/
function ScrollFade({ className, ...props }: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [more, setMore] = React.useState({ left: false, right: false })

  React.useEffect(() => {
    const container = ref.current

    if (!container) {
      return
    }

    // 1px of slack, since scroll positions can be fractional
    const update = () => {
      const left = container.scrollLeft > 1
      const right = container.scrollLeft + container.clientWidth < container.scrollWidth - 1

      // Bails out of a re-render when nothing changed, which is most scroll events
      setMore((current) =>
        current.left === left && current.right === right ? current : { left, right },
      )
    }

    update()
    container.addEventListener("scroll", update, { passive: true })

    // The screen changes the box's width, the content its first child's
    const observer = new ResizeObserver(update)
    observer.observe(container)

    if (container.firstElementChild) {
      observer.observe(container.firstElementChild)
    }

    return () => {
      container.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      {...props}
      ref={ref}
      data-more-left={more.left || undefined}
      data-more-right={more.right || undefined}
      className={cn(
        // One mask for both sides; a side without more to scroll fades over 0px, i.e. not at all
        "[scrollbar-width:none] overflow-x-auto data-more-left:[--fade-left:3rem] data-more-right:[--fade-right:3rem]",
        "data-more-left:[mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%_-_var(--fade-right,0px)),transparent)]",
        "data-more-right:[mask-image:linear-gradient(to_right,transparent,black_var(--fade-left,0px),black_calc(100%_-_var(--fade-right,0px)),transparent)]",
        className,
      )}
    />
  )
}

export { ScrollFade }
