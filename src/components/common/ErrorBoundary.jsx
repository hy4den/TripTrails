import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.box}>
            <h1 className={styles.title}>Bir şeyler yanlış gitti</h1>
            <p className={styles.message}>
              Beklenmedik bir hata oluştu. Sayfayı yenileyerek tekrar deneyebilirsiniz.
            </p>
            <button
              className={styles.btn}
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
