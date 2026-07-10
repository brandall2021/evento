import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <h2 style={{ marginBottom: 16 }}>Algo salió mal</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            {this.state.error.message}
          </p>
          <button
            className="btn-primary"
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
          >
            Volver al inicio
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
