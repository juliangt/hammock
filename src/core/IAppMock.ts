import type { Hono } from 'hono';

export interface IAppMock {
  name: string;
  version: string;
  basePath: string;
  registerRoutes(server: Hono): void;
}
