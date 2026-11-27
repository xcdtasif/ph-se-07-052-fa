import { Suspense } from "react"

import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth-fetch"

import { AuthLink } from "./auth-link"
import { HomeLink } from "./home-link"
import { LogoutButton } from "./logout-button"
import { MenuButton, MobileMenu } from "./mobile-menu"
import { NavLink } from "./nav-link"
import { ThemeToggle } from "./theme-toggle"

// Whether someone is logged in. Reads the session, so callers sit inside <Suspense>.
async function readLoggedIn(): Promise<boolean> {
  return (await getCurrentUser()).success
}

// Desktop: the public pages; Dashboard joins them once the dashboards exist
function NavbarLinks() {
  return (
    <ul className="flex items-center gap-1">
      <li>
        <NavLink href="/jobs">Jobs</NavLink>
      </li>
    </ul>
  )
}

/*
Desktop: the theme toggle, then Log out, or Sign up and Log in. The toggle waits with
the buttons, so it appears where it stays instead of moving once they replace their placeholder
*/
async function NavbarAccount() {
  const loggedIn = await readLoggedIn()

  return loggedIn ? (
    <>
      <ThemeToggle />
      <LogoutButton />
    </>
  ) : (
    <>
      <ThemeToggle />
      <AuthLink href="/signup" className={buttonVariants({ variant: "outline" })}>
        Sign up
      </AuthLink>
      <AuthLink href="/login" className={buttonVariants()}>
        Log in
      </AuthLink>
    </>
  )
}

// Below desktop width: the links and account buttons in a sheet
async function NavbarMobileMenu() {
  return <MobileMenu loggedIn={await readLoggedIn()} />
}

/*
Desktop: the brand, the links centred together, the theme toggle and account buttons.
Smaller screens: the brand, the theme toggle and a menu button. The parts that depend on the
session stream in at the same size as their placeholders.
*/
export function Navbar() {
  return (
    <header className="bg-card sticky top-0 z-40 border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]"
      >
        <HomeLink className="justify-self-start text-lg font-semibold" />
        <div className="hidden lg:block">
          <NavbarLinks />
        </div>
        <div className="hidden items-center gap-2 justify-self-end lg:flex">
          {/* As wide as a guest's toggle and buttons, 181px */}
          <Suspense fallback={<div className="skeleton h-8 w-46 rounded-lg" aria-hidden="true" />}>
            <NavbarAccount />
          </Suspense>
        </div>
        {/* The menu button's placeholder is its own size, so the toggle needn't wait for it */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Suspense fallback={<MenuButton disabled />}>
            <NavbarMobileMenu />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}
