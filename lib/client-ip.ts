import "server-only"
import { headers } from "next/headers"

/*
The visitor's IP address, for the backend's rate limits. Vercel sets X-Forwarded-For to it,
replacing whatever the browser sent; locally it's this machine's address
*/
export const getClientIp = async () =>
  (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || null
