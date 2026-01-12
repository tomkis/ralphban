import type { Pool } from 'pg';
import type { Request, Response } from 'express';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@ralphban/api';
import { createContext } from './context.js';

export function createTrpcHandler(pool: Pool) {
  return async (req: Request, res: Response) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }

    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: new Request(url, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
      }),
      router: appRouter,
      createContext: () => createContext(pool),
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.send(body);
  };
}
