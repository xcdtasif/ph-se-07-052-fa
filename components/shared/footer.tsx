import { HomeLink } from "./home-link"

// The dashed line spans the content column, so it lines up with the page's cards
export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4">
      <div className="divider-dashed text-muted-foreground flex flex-col items-center justify-between gap-2 py-6 text-sm sm:flex-row">
        <HomeLink className="text-foreground text-lg font-semibold" />
        <p>Load shedding and outage updates</p>
      </div>
    </footer>
  )
}
