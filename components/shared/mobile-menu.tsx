"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState, type ReactNode } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { AuthLink } from "./auth-link"
import { HomeLink } from "./home-link"
import { LogoutDialog } from "./logout-button"

// Large links
const menuLinkClass = buttonVariants({
  variant: "ghost",
  className: "h-auto px-3 py-1.5 text-lg font-normal",
})

// The navbar's menu button; the sheet's close button sits over it at the same size
export function MenuButton({ disabled }: { disabled?: boolean }) {
  const icon = (
    <>
      <Menu className="size-5" aria-hidden="true" />
      <span className="sr-only">Open menu</span>
    </>
  )

  /*
  The placeholder while the session loads isn't inside a Sheet, so it can't be a trigger. The
  open menu's tint is off: it showed beside the sliding sheet, like a stuck hover after a tap
  */
  return disabled ? (
    <Button variant="ghost" size="icon" disabled>
      {icon}
    </Button>
  ) : (
    <SheetTrigger
      render={
        <Button
          variant="ghost"
          size="icon"
          className="aria-expanded:bg-transparent dark:aria-expanded:bg-transparent"
        />
      }
    >
      {icon}
    </SheetTrigger>
  )
}

/*
The navbar links and account buttons below desktop width, in a sheet from the right: 80% of
the screen, up to 20rem, with the rest blurred like behind a dialog. The links sit in the
middle, the current one semibold; the account buttons sit at the bottom under a dashed line, all
the same width. Log out closes the sheet, then asks in a dialog outside it, so the dialog isn't
drawn over the menu.
*/
export function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  // Log out was pressed: open its dialog once the sheet has closed
  const logoutNext = useRef(false)

  const close = () => setOpen(false)

  const menuLink = (href: string, children: ReactNode) => {
    const current = href === pathname

    return (
      <Link
        href={href}
        onClick={close}
        aria-current={current ? "page" : undefined}
        className={cn(menuLinkClass, current && "font-semibold")}
      >
        {children}
      </Link>
    )
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        // After the closing animation, so the dialog doesn't open over the sliding sheet
        onOpenChangeComplete={(isOpen) => {
          if (!isOpen && logoutNext.current) {
            logoutNext.current = false
            setLogoutOpen(true)
          }
        }}
      >
        <MenuButton />
        <SheetContent
          showCloseButton={false}
          className="gap-0 data-[side=right]:w-4/5 data-[side=right]:max-w-xs data-[side=right]:sm:max-w-xs"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {/*
        Laid out like the navbar: 3.5rem tall plus a 1px line, so the dashed line lines up with
        the navbar's bottom border and the close button sits exactly over the menu button. The
        content below keeps the same 1rem sides, so GridLine and the buttons line up.
        */}
          <div className="border-foreground/25 box-content flex h-14 items-center justify-between border-b border-dashed px-4">
            <HomeLink onClick={close} className="text-lg font-semibold" />
            <SheetClose render={<Button variant="ghost" size="icon" />}>
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </SheetClose>
          </div>
          <div className="flex flex-1 flex-col gap-6 px-4 py-6">
            <nav
              aria-label="Menu"
              className="flex flex-1 flex-col items-center justify-center gap-3"
            >
              {menuLink("/jobs", "Jobs")}
              {loggedIn && menuLink("/dashboard", "Dashboard")}
            </nav>
            <div className="divider-dashed flex flex-col gap-2 pt-6">
              {loggedIn ? (
                <>
                  <Button
                    onClick={() => {
                      logoutNext.current = true
                      close()
                    }}
                  >
                    Log out
                  </Button>
                  <Link
                    href="/profile"
                    onClick={close}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <AuthLink href="/login" onClick={close} className={buttonVariants()}>
                    Log in
                  </AuthLink>
                  <AuthLink
                    href="/signup"
                    onClick={close}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Sign up
                  </AuthLink>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  )
}
