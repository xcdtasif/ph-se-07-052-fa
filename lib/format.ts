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
