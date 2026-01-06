"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode | ((error: Error) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const fallback = this.props.fallback

      if (typeof fallback === "function") {
        return fallback(this.state.error)
      } else if (fallback) {
        return fallback
      } else {
        return (
          <div className="bg-red-100 border border-red-300 text-red-900 p-5 rounded my-5">
            <h3 className="text-red-900 mt-0 mb-4">Something went wrong</h3>
            <p>An unexpected error occurred. Please try refreshing the page.</p>
            <details className="my-4">
              <summary className="cursor-pointer font-bold mb-3 text-red-900 hover:text-danger">
                Technical Details
              </summary>
              <pre>{this.state.error?.message}</pre>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                className="border-0 rounded cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                Try Again
              </button>
              <button
                className="border-0 rounded cursor-pointer transition-colors bg-secondary text-white text-sm py-2 px-4 m-1 hover:bg-gray-700"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      }
    }

    return this.props.children
  }
}
