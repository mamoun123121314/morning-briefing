// In-memory rate limiter (resets on server restart — fine for free tier)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300000);

// Input validation helpers
export function sanitizeString(input: string, maxLength: number = 500): string {
  return input
    .replace(/[<>]/g, '') // Strip HTML tags
    .replace(/[\\]/g, '') // Strip backslashes
    .trim()
    .slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export function sanitizeCity(city: string): string {
  return city.replace(/[^a-zA-Z\s,.-]/g, '').trim().slice(0, 100);
}

export function sanitizeDisplayName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().slice(0, 50);
}

export function sanitizeHabitName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().slice(0, 50);
}
