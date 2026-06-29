const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetAt: Date.now() + 60000 });
    return { allowed: true, remaining: limit - 1, resetIn: 60 };
  }

  if (entry.count >= limit) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: Math.ceil((entry.resetAt - Date.now()) / 1000) 
    };
  }

  entry.count++;
  return { 
    allowed: true, 
    remaining: limit - entry.count, 
    resetIn: Math.ceil((entry.resetAt - Date.now()) / 1000) 
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);