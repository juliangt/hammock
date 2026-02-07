import { Hono } from 'hono';
import { z } from 'zod';
import { createRequire } from 'node:module';
import type { IAppMock } from '../../core/IAppMock.js';
import type { Entity, SystemConfig, ServiceCallRequest, ServiceResponse } from '../../types.js';

const require = createRequire(import.meta.url);
const initialStates = require('./states.json') as Record<string, Entity>;

const ServiceCallSchema = z.object({
  domain: z.string(),
  service: z.string(),
  service_data: z.record(z.unknown()).default({}),
});

export class HomeAssistantMock implements IAppMock {
  name = 'home-assistant';
  version = process.env.HOME_ASSISTANT_VERSION ?? '2026.2.1';
  basePath = '/api';

  private states: Record<string, Entity> = initialStates;
  private readonly config: SystemConfig = {
    location_name: process.env.HOME_ASSISTANT_LOCATION_NAME ?? 'Mock Home',
    latitude: parseFloat(process.env.HOME_ASSISTANT_LATITUDE ?? '40.4168'),
    longitude: parseFloat(process.env.HOME_ASSISTANT_LONGITUDE ?? '-3.7038'),
    elevation: parseInt(process.env.HOME_ASSISTANT_ELEVATION ?? '667', 10),
    unit_system: {
      length: process.env.HOME_ASSISTANT_UNIT_SYSTEM_LENGTH ?? 'm',
      mass: process.env.HOME_ASSISTANT_UNIT_SYSTEM_MASS ?? 'kg',
      temperature: process.env.HOME_ASSISTANT_UNIT_SYSTEM_TEMPERATURE ?? '°C',
      volume: process.env.HOME_ASSISTANT_UNIT_SYSTEM_VOLUME ?? 'L',
    },
    timezone: process.env.HOME_ASSISTANT_TIMEZONE ?? 'Europe/Madrid',
    components: (process.env.HOME_ASSISTANT_COMPONENTS ?? 'light,switch,sensor,binary_sensor,automation').split(','),
    config_dir: '/config',
    version: this.version,
  };

  registerRoutes(server: Hono): void {
    const app = new Hono();
    const basePath = this.basePath;

    app.get(`${basePath}/config`, (c) => c.json(this.config));

    app.get(`${basePath}/states`, (c) => c.json(Object.values(this.states)));

    app.get(`${basePath}/states/:entity_id`, (c) => {
      const { entity_id } = c.req.param();
      const entity = this.states[entity_id];

      if (!entity) {
        return c.json({ code: 'not_found', message: `Entity ${entity_id} not found` }, 404);
      }

      return c.json(entity);
    });

    app.post(`${basePath}/services/:domain/:service`, async (c) => {
      const { domain, service } = c.req.param();

      try {
        const body = await c.req.json();
        const validated = ServiceCallSchema.parse({
          domain,
          service,
          service_data: body,
        });

        if (!validated.service_data.entity_id) {
          return c.json({ code: 'invalid_request', message: 'entity_id is required' }, 400);
        }

        this.handleServiceCall(validated);

        const contextId = this.generateContextId();

        return c.json<ServiceResponse>({
          context: {
            id: contextId,
            parent_id: null,
            user_id: null,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = (error as z.ZodError).issues;
          return c.json(
            { code: 'invalid_request', message: issues[0]?.message || 'Validation error' },
            400,
          );
        }
        console.error('Error in service call:', error);
        return c.json({ code: 'internal_error', message: String(error) }, 500);
      }
    });

    app.get(`${basePath}/events`, (c) => {
      return c.text('data: {"type":"connected"}\n\n', 200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
    });

    server.route('/', app);
  }

  private handleServiceCall(request: ServiceCallRequest): void {
    const { domain, service, service_data } = request;
    const data = service_data || {};

    if (domain === 'light') {
      if (service === 'turn_on') {
        const entityId = data.entity_id;
        if (entityId && typeof entityId === 'string' && this.states[entityId]) {
          const entity = this.states[entityId];
          entity.state = 'on';
          entity.last_updated = new Date().toISOString();
          entity.last_changed = new Date().toISOString();

          if (data.brightness !== undefined) {
            entity.attributes.brightness = data.brightness as number;
          }
        }
      } else if (service === 'turn_off') {
        const entityId = data.entity_id;
        if (entityId && typeof entityId === 'string' && this.states[entityId]) {
          const entity = this.states[entityId];
          entity.state = 'off';
          entity.last_updated = new Date().toISOString();
          entity.last_changed = new Date().toISOString();
        }
      }
    }

    if (domain === 'switch') {
      if (service === 'turn_on') {
        const entityId = data.entity_id;
        if (entityId && typeof entityId === 'string' && this.states[entityId]) {
          const entity = this.states[entityId];
          entity.state = 'on';
          entity.last_updated = new Date().toISOString();
          entity.last_changed = new Date().toISOString();
        }
      } else if (service === 'turn_off') {
        const entityId = data.entity_id;
        if (entityId && typeof entityId === 'string' && this.states[entityId]) {
          const entity = this.states[entityId];
          entity.state = 'off';
          entity.last_updated = new Date().toISOString();
          entity.last_changed = new Date().toISOString();
        }
      }
    }
  }

  private generateContextId(): string {
    return crypto.randomUUID();
  }
}
