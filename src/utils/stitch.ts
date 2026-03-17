import { Stitch, StitchToolClient } from '@google/stitch-sdk';
import { z } from 'zod';

export function getStitchClient() {
  const apiKey = process.env.STITCH_API_KEY;
  if (!apiKey) {
    throw new Error('STITCH_API_KEY environment variable is missing.');
  }

  // Under the hood, Stitch instance manages authorization and project scoping
  const toolClient = new StitchToolClient({ apiKey });
  const stitch = new Stitch(toolClient);
  
  return { stitch, toolClient };
}