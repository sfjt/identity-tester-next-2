interface MFAErrorFallbackProps {
  error?: Error
  componentName?: string
}

export default function MFAErrorFallback({ error, componentName = "MFA Component" }: MFAErrorFallbackProps) {
  return (
    <div className="bg-red-100 border border-red-300 text-red-900 p-5 rounded my-5">
      <h3 className="text-red-900 mt-0 mb-4">{componentName} Error</h3>
      <p>There was an issue with the MFA system. This could be due to:</p>
      <ul className="my-3 pl-5">
        <li className="mb-1">Network connectivity issues</li>
        <li className="mb-1">Auth0 API service disruption</li>
        <li className="mb-1">Invalid MFA token or permissions</li>
        <li className="mb-1">Unexpected data format</li>
      </ul>

      {error && (
        <details className="my-4">
          <summary className="cursor-pointer font-bold mb-3 text-red-900 hover:text-danger">Technical Details</summary>
          <div className="bg-gray-200 p-4 rounded my-3 break-all font-mono text-xs">
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

      <div className="mt-4 flex gap-3 flex-wrap">
        <button
          className="border-0 rounded cursor-pointer text-base py-3 px-6 m-1 transition-colors bg-primary text-white hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
        <button
          className="border-0 rounded cursor-pointer transition-colors bg-secondary text-white text-sm py-2 px-4 m-1 hover:bg-gray-700"
          onClick={() => (window.location.href = "/mfa")}
        >
          Restart MFA Testing
        </button>
      </div>

      <p className="mt-4 mb-0 italic">
        <small>If this error persists, check your Auth0 configuration and MFA token permissions.</small>
      </p>
    </div>
  )
}
