"use client"

import { useState, useTransition, type ReactElement } from "react"
import { toast } from "sonner"

import { logoutAction } from "@/app/(auth)/_actions/auth-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type LogoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The button that opens it; none where something else opens it, like the phone menu
  trigger?: ReactElement
}

/*
Asks before logging out, then toasts, logs out and redirects. It stays open until the redirect,
its button saying "Logging out…"
*/
export function LogoutDialog({ open, onOpenChange, trigger }: LogoutDialogProps) {
  const [pending, startTransition] = useTransition()

  const logout = () =>
    startTransition(async () => {
      toast.success("Logged out successfully")
      await logoutAction()
    })

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      {trigger && <DialogTrigger render={trigger}>Log out</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log out?</DialogTitle>
          <DialogDescription>
            You&apos;ll need to log in again to use your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />} disabled={pending}>
            Cancel
          </DialogClose>
          <Button onClick={logout} disabled={pending}>
            {pending ? "Logging out…" : "Log out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// The navbar's primary Log out button, opening the dialog
export function LogoutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <LogoutDialog open={open} onOpenChange={setOpen} trigger={<Button className={className} />} />
  )
}
