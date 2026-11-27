import { LoaderCircle } from "lucide-react"

export default function Loading() {
  return (
    <div role="status" className="flex flex-1 items-center justify-center">
      <LoaderCircle className="text-muted-foreground size-8 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
