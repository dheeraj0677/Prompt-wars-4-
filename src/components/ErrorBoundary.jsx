import { Component } from 'react';

/**
 * ErrorBoundary — catches rendering errors in child components and
 * displays a user-friendly fallback UI instead of crashing the entire app.
 *
 * Usage: Wrap any component tree with <ErrorBoundary> to protect it.
 *
 * @example
 * <ErrorBoundary>
 *   <AppContent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging (would go to a logging service in production)
    console.error('[FanPulse ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center',
            color: '#e2e8f0',
            fontFamily: 'Outfit, Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f59e0b' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '400px', marginBottom: '1.5rem' }}>
            FanPulse encountered an unexpected error. For immediate help, please visit the nearest Information Desk
            or contact stadium staff directly.
          </p>
          <button
            onClick={this.handleReset}
            aria-label="Try again to reload the application"
            style={{
              padding: '0.6rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
            onMouseOver={(e) => { e.target.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; }}
            onFocus={(e) => { e.target.style.transform = 'translateY(-1px)'; }}
            onBlur={(e) => { e.target.style.transform = 'translateY(0)'; }}
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b', maxWidth: '600px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Error Details (dev only)</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
