import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { MockServer } from '../../src/core/Server.js';
import type { IAppMock } from '../../src/core/IAppMock.js';

class MockAppMock implements IAppMock {
  name = 'test-app';
  version = '1.0.0';
  basePath = '/test';

  registerRoutes(server: Hono): void {
    server.get(`${this.basePath}/ping`, (c) => c.json({ message: 'pong' }));
  }
}

describe('MockServer', () => {
  let server: MockServer;
  let honoInstance: Hono;

  beforeEach(() => {
    server = new MockServer({ port: 3001, logLevel: 'silent' });
    honoInstance = server['server'];
  });

  it('should create server with default config', () => {
    const defaultServer = new MockServer();
    expect(defaultServer).toBeDefined();
  });

  it('should create server with custom config', () => {
    const customServer = new MockServer({ port: 4000, logLevel: 'debug' });
    expect(customServer).toBeDefined();
  });

  it('should register an app', async () => {
    const app = new MockAppMock();
    server.registerApp(app);

    const response = await honoInstance.request('/test/ping');
    expect(response.status).toBe(200);
  });

  it('should register multiple apps', async () => {
    const app1 = new MockAppMock();
    const app2 = new MockAppMock();
    app2.name = 'test-app-2';
    app2.basePath = '/test2';

    server.registerApp(app1);
    server.registerApp(app2);

    const response1 = await honoInstance.request('/test/ping');
    const response2 = await honoInstance.request('/test2/ping');

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('should apply CORS middleware', async () => {
    server.registerApp(new MockAppMock());

    const response = await honoInstance.request('/test/ping', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost' },
    });

    expect([204, 200]).toContain(response.status);
  });

  it('should return 404 for non-existent routes', async () => {
    server.registerApp(new MockAppMock());

    const response = await honoInstance.request('/non-existent');
    expect(response.status).toBe(404);
  });
});
