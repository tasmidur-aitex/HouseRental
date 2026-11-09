import { Component } from 'react';

/** Shows a friendly screen instead of a blank page if a component crashes. */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container narrow section">
        <div className="card result-card bad">
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Reloading the page usually fixes it.</p>
          <div className="link-row center">
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload page</button>
            <a className="btn btn-outline" href="/">Go to home</a>
          </div>
        </div>
      </div>
    );
  }
}
