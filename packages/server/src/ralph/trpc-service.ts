import type { IRalphService, RalphStatus } from '@ralphban/api';
import { runRalphLoop } from './service.js';

let isRunning = false;

export function createRalphService(workingDirectory: string): IRalphService {
  return {
    async getStatus(): Promise<RalphStatus> {
      return { isRunning };
    },
    async start(): Promise<void> {
      if (isRunning) {
        return;
      }
      isRunning = true;
      runRalphLoop(workingDirectory).finally(() => {
        isRunning = false;
      });
    },
  };
}
