"use client"

import { Component, type ReactNode } from "react"
import { SessionProvider } from "next-auth/react"

class SessionBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <>{this.props.children}</>
    return <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>{this.props.children}</SessionProvider>
  }
}

export function Providers({ children }: { children: ReactNode }) {
  return <SessionBoundary>{children}</SessionBoundary>
}
