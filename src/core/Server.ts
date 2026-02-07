import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { IAppMock } from './IAppMock.js';

export interface ServerConfig {
  port: number;
  logLevel: string;
}

export class MockServer {
  private server: Hono;
  private apps: IAppMock[] = [];
  private config: ServerConfig;

  constructor(config?: Partial<ServerConfig>) {
    this.config = {
      port: config?.port ?? parseInt(process.env.SERVER_PORT ?? '3000', 10),
      logLevel: config?.logLevel ?? process.env.LOG_LEVEL ?? 'info',
    };

    this.server = new Hono();

    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    if (this.config.logLevel === 'info' || this.config.logLevel === 'debug') {
      this.server.use('*', logger());
    }
    this.server.use('*', cors());
  }

  registerApp(app: IAppMock): void {
    this.apps.push(app);
    app.registerRoutes(this.server);
  }

  async start(): Promise<void> {
    console.log('Starting Mock Server...');
    console.log(`Registered apps: ${this.apps.map((app) => `${app.name}@${app.version}`).join(', ')}`);

    try {
      serve({
        fetch: this.server.fetch,
        port: this.config.port,
      }, (_info) => {
        console.log(`Mock Server listening on http://localhost:${this.config.port}`);
        console.log(`Available base paths: ${[...new Set(this.apps.map((app) => app.basePath))].join(', ')}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }
}
