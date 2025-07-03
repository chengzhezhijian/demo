import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import * as Sentry from '@sentry/react';

// 初始化错误监控
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ['localhost', /^https:\/\/yourdomain\.com/],
      }),
      new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 添加性能监控指标
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = {
        loadTime: performance.now(),
        wasmLoaded: !!window.lotteryAlgorithm
      };
      console.log('Performance metrics:', perfData);
      // 在生产环境发送到监控服务
      if (import.meta.env.PROD && window.sentry) {
        window.sentry.addBreadcrumb({
          message: 'App loaded',
          category: 'performance',
          data: perfData,
          level: 'info'
        });
      }
    }, 1000);
  });
}