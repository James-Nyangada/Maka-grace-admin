import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthGuard } from "@/components/auth-guard"
import "./global.css"

export const metadata = {
  title: "Travel Tours Dashboard",
  description: "Travel and Tour Management Dashboard",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <div className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
      <AuthGuard>
        <Suspense fallback={null}>{children}</Suspense>
      </AuthGuard>
      <Analytics />
    </div>
  )
}
