/*
Fixed locale and time zone, so the server and the browser format the same value the same way
(a mismatch would break hydration)
*/
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dhaka",
})

// "27 Nov 2026, 11:27"
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso))

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" })

// A calendar date from the backend, like "2026-12-18", as "18 Dec 2026"
export const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`))

const bdtFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 })

// Whole taka, like "BDT 1,000"; the ৳ sign isn't in Geist, so its fallback font varies by browser
export const formatBdt = (amount: number) => `BDT ${bdtFormat.format(amount)}`
