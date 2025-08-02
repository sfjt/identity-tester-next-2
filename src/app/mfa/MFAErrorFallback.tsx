interface MFAErrorFallbackProps {
  error?: Error
  componentName?: string
}

export default function MFAErrorFallback({ error, componentName = "MFA Component" }: MFAErrorFallbackProps) {
  return (
    <div className="error-boundary">
      <h3>{componentName} Error</h3>
      <p>There was an issue with the MFA system. This could be due to:</p>
      <ul>
        <li>Network connectivity issues</li>
        <li>Auth0 API service disruption</li>
        <li>Invalid MFA token or permissions</li>
        <li>Unexpected data format</li>
      </ul>

      {error && (
        <details className="error-details">
          <summary>Technical Details</summary>
          <div className="token-display">
            <strong>Error:</strong> {error.message}
            {error.stack && (
              <>
                <br />
                <strong>Stack Trace:</strong>
                <pre>{error.stack}</pre>
              </>
            )}
          </div>
        </details>
      )}

      <div className="error-actions">
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
        <button className="btn btn-secondary" onClick={() => (window.location.href = "/mfa")}>
          Restart MFA Testing
        </button>
      </div>

      <p className="error-help">
        <small>If this error persists, check your Auth0 configuration and MFA token permissions.</small>
      </p>
    </div>
  )
}
