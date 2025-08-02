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
      
      if (typeof fallback === 'function') {
        return fallback(this.state.error)
      } else if (fallback) {
        return fallback
      } else {
        return (
          <div className="error-boundary">
            <h3>Something went wrong</h3>
            <p>An unexpected error occurred. Please try refreshing the page.</p>
            <details className="error-details">
              <summary>Technical Details</summary>
              <pre>{this.state.error?.message}</pre>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={() => this.setState({ hasError: false, error: undefined })}>
                Try Again
              </button>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
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
