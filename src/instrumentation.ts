import * as Sentry from '@sentry/nextjs';

export function onRequestError(err: any, request: any, context: any) {
  Sentry.captureRequestError(err, request, context);
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    });
  }
}
