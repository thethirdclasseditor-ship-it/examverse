import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    })
    .catch(() => {});
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: String(error?.message || error || 'Unknown error') };
  }

  handleReset = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('examverse')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      window.location.hash = '#dashboard';
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: "'Hind Siliguri', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 440,
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div style={{ fontSize: 38, marginBottom: 8 }}>🛠️</div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
              সেশন আপডেট প্রয়োজন
            </h2>
            <p style={{ fontSize: 13.5, color: '#475569', marginBottom: 16 }}>
              নতুন আপডেটের সাথে পুরনো ব্রাউজার ক্যাশের অমিল হয়েছে। নিচের বাটনে ক্লিক করলেই সাইটটি সাথে সাথে ঠিক হয়ে যাবে।
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              🔄 ক্যাশ ক্লিয়ার ও রিলোড করো
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
