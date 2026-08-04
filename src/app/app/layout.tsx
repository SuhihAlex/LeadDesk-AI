import type { ReactNode } from "react"

type ApplicationLayoutProps = {
  children: ReactNode
}

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  return children
}