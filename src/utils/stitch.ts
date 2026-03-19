import { Stitch, StitchToolClient } from '@google/stitch-sdk';

// Singleton instance cache
let cachedClient: { stitch: Stitch; toolClient: StitchToolClient } | null = null;

export function getStitchClient() {
  // Return cached instance if available
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.STITCH_API_KEY;
  if (!apiKey) {
    throw new Error('STITCH_API_KEY environment variable is missing.');
  }

  // Under the hood, Stitch instance manages authorization and project scoping
  const toolClient = new StitchToolClient({ apiKey });
  const stitch = new Stitch(toolClient);
  
  // Cache for reuse
  cachedClient = { stitch, toolClient };
  return cachedClient;
}

// Helper to reset client (useful for testing)
export function resetStitchClient() {
  cachedClient = null;
}