import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { HomeAssistantMock } from '../../../src/apps/home-assistant/HAHandler.js';
import type { Entity, SystemConfig } from '../../../src/types.js';
import {
  mockEntityLight,
  mockEntitySwitch,
  mockEntitySensor,
  mockStates,
  EntityFactory,
  ServiceCallFactory,
  makeGetRequest,
  makePostRequest,
  parseJsonResponse,
  assertResponseStatus,
  assertJsonContentType,
  assertHeaderValue,
  mockCryptoRandomUUID,
} from '../../../src/test-utils/index.js';

describe('HomeAssistantMock', () => {
  let handler: HomeAssistantMock;
  let honoInstance: Hono;

  beforeEach(() => {
    handler = new HomeAssistantMock();
    honoInstance = new Hono();
    handler.registerRoutes(honoInstance);
  });

  afterEach(() => {
  });

  describe('GET /api/config', () => {
    it('should return system configuration', async () => {
      const response = await makeGetRequest(honoInstance, '/api/config');
      assertResponseStatus(response, 200);
      assertJsonContentType(response);

      const config = await parseJsonResponse<SystemConfig>(response);
      expect(config).toHaveProperty('location_name');
      expect(config).toHaveProperty('latitude');
      expect(config).toHaveProperty('longitude');
      expect(config).toHaveProperty('version');
    });

    it('should include unit_system', async () => {
      const response = await makeGetRequest(honoInstance, '/api/config');
      const config = await parseJsonResponse<SystemConfig>(response);

      expect(config.unit_system).toHaveProperty('length');
      expect(config.unit_system).toHaveProperty('mass');
      expect(config.unit_system).toHaveProperty('temperature');
    });

    it('should include components array', async () => {
      const response = await makeGetRequest(honoInstance, '/api/config');
      const config = await parseJsonResponse<SystemConfig>(response);

      expect(Array.isArray(config.components)).toBe(true);
      expect(config.components).toContain('light');
      expect(config.components).toContain('switch');
    });

    it('should match mock system config structure', async () => {
      const response = await makeGetRequest(honoInstance, '/api/config');
      const config = await parseJsonResponse<SystemConfig>(response);

      expect(typeof config.location_name).toBe('string');
      expect(typeof config.latitude).toBe('number');
      expect(typeof config.longitude).toBe('number');
      expect(typeof config.elevation).toBe('number');
      expect(typeof config.version).toBe('string');
    });
  });

  describe('GET /api/states', () => {
    it('should return all entities', async () => {
      const response = await makeGetRequest(honoInstance, '/api/states');
      assertResponseStatus(response, 200);
      assertJsonContentType(response);

      const states = await parseJsonResponse<Entity[]>(response);
      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBeGreaterThan(0);
    });

    it('should include entity with entity_id', async () => {
      const response = await makeGetRequest(honoInstance, '/api/states');
      const states = await parseJsonResponse<Entity[]>(response);

      const lightEntity = states.find((s) => s.entity_id === 'light.living_room');
      expect(lightEntity).toBeDefined();
      expect(lightEntity).toHaveProperty('state');
      expect(lightEntity).toHaveProperty('attributes');
    });

    it('should return entities matching initial states', async () => {
      const response = await makeGetRequest(honoInstance, '/api/states');
      const states = await parseJsonResponse<Entity[]>(response);

      expect(states.length).toBe(Object.keys(mockStates).length);
      const entityIds = states.map((s) => s.entity_id);
      expect(entityIds).toContain('light.living_room');
      expect(entityIds).toContain('switch.kitchen');
      expect(entityIds).toContain('sensor.temperature_living');
    });

    it('should preserve entity structure', async () => {
      const response = await makeGetRequest(honoInstance, '/api/states');
      const states = await parseJsonResponse<Entity[]>(response);

      const entity = states[0];
      expect(entity).toHaveProperty('entity_id');
      expect(entity).toHaveProperty('state');
      expect(entity).toHaveProperty('attributes');
      expect(entity).toHaveProperty('last_changed');
      expect(entity).toHaveProperty('last_updated');
      expect(entity).toHaveProperty('context');
    });
  });

  describe('GET /api/states/:entity_id', () => {
    it('should return specific entity', async () => {
      const response = await makeGetRequest(honoInstance, '/api/states/light.living_room');
      assertResponseStatus(response, 200);

      const entity = await parseJsonResponse<Entity>(response);
      expect(entity.entity_id).toBe('light.living_room');
    });

    it('should return 404 for non-existent entity', async () => {
      const response = await makeGetRequest(honoInstance, '/api/states/non.existent');
      assertResponseStatus(response, 404);

      const error = await parseJsonResponse<{ code: string; message: string }>(response);
      expect(error).toHaveProperty('code', 'not_found');
      expect(error.message).toContain('non.existent');
    });

    it('should return complete entity with all properties', async () => {
      const response = await makeGetRequest(honoInstance, '/api/states/light.living_room');
      const entity = await parseJsonResponse<Entity>(response);

      expect(entity).toMatchObject({
        entity_id: 'light.living_room',
        state: 'off',
      });
      expect(entity.context).toHaveProperty('id');
      expect(entity.context).toHaveProperty('user_id');
      expect(entity.context).toHaveProperty('parent_id');
    });
  });

  describe('POST /api/services/light/turn_on', () => {
    it('should turn on light', async () => {
      const request = ServiceCallFactory.createTurnOnLightRequest('light.living_room');
      const response = await makePostRequest(honoInstance, '/api/services/light/turn_on', request.service_data);
      assertResponseStatus(response, 200);

      const statesResponse = await makeGetRequest(honoInstance, '/api/states/light.living_room');
      const entity = await parseJsonResponse<Entity>(statesResponse);
      expect(entity.state).toBe('on');
    });

    it('should set brightness', async () => {
      const request = ServiceCallFactory.createTurnOnLightRequest('light.living_room', { brightness: 200 });
      const response = await makePostRequest(honoInstance, '/api/services/light/turn_on', request.service_data);
      assertResponseStatus(response, 200);

      const statesResponse = await makeGetRequest(honoInstance, '/api/states/light.living_room');
      const entity = await parseJsonResponse<Entity>(statesResponse);
      expect(entity.attributes.brightness).toBe(200);
    });

    it('should update last_changed and last_updated timestamps', async () => {
      const { mockId, restore } = mockCryptoRandomUUID();
      try {
        const request = ServiceCallFactory.createTurnOnLightRequest('light.living_room');
        await makePostRequest(honoInstance, '/api/services/light/turn_on', request.service_data);

        const statesResponse = await makeGetRequest(honoInstance, '/api/states/light.living_room');
        const entity = await parseJsonResponse<Entity>(statesResponse);

        expect(entity.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(entity.last_changed).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      } finally {
        restore();
      }
    });

    it('should return 400 for invalid request', async () => {
      const response = await makePostRequest(honoInstance, '/api/services/light/turn_on', { invalid: 'data' });
      assertResponseStatus(response, 400);

      const error = await parseJsonResponse<{ code: string; message: string }>(response);
      expect(error).toHaveProperty('code', 'invalid_request');
    });

    it('should return 400 for missing entity_id', async () => {
      const request = ServiceCallFactory.withoutEntityId('light', 'turn_on');
      const response = await makePostRequest(honoInstance, '/api/services/light/turn_on', request.service_data);
      assertResponseStatus(response, 400);

      const error = await parseJsonResponse<{ code: string; message: string }>(response);
      expect(error.message).toContain('entity_id');
    });

    it('should return context id in response', async () => {
      const { mockId, restore } = mockCryptoRandomUUID();
      try {
        const request = ServiceCallFactory.createTurnOnLightRequest('light.living_room');
        const response = await makePostRequest(honoInstance, '/api/services/light/turn_on', request.service_data);
        const result = await parseJsonResponse<{ context: { id: string } }>(response);

        expect(result).toHaveProperty('context');
        expect(result.context.id).toBe(mockId);
      } finally {
        restore();
      }
    });
  });

  describe('POST /api/services/light/turn_off', () => {
    it('should turn off light', async () => {
      await makePostRequest(honoInstance, '/api/services/light/turn_on', { entity_id: 'light.living_room' });

      const request = ServiceCallFactory.createTurnOffLightRequest('light.living_room');
      const response = await makePostRequest(honoInstance, '/api/services/light/turn_off', request.service_data);
      assertResponseStatus(response, 200);

      const statesResponse = await makeGetRequest(honoInstance, '/api/states/light.living_room');
      const entity = await parseJsonResponse<Entity>(statesResponse);
      expect(entity.state).toBe('off');
    });
  });

  describe('POST /api/services/switch/turn_on', () => {
    it('should turn on switch', async () => {
      const request = ServiceCallFactory.createTurnOnSwitchRequest('switch.kitchen');
      const response = await makePostRequest(honoInstance, '/api/services/switch/turn_on', request.service_data);
      assertResponseStatus(response, 200);

      const statesResponse = await makeGetRequest(honoInstance, '/api/states/switch.kitchen');
      const entity = await parseJsonResponse<Entity>(statesResponse);
      expect(entity.state).toBe('on');
    });
  });

  describe('POST /api/services/switch/turn_off', () => {
    it('should turn off switch', async () => {
      await makePostRequest(honoInstance, '/api/services/switch/turn_on', { entity_id: 'switch.kitchen' });

      const request = ServiceCallFactory.createTurnOffSwitchRequest('switch.kitchen');
      const response = await makePostRequest(honoInstance, '/api/services/switch/turn_off', request.service_data);
      assertResponseStatus(response, 200);

      const statesResponse = await makeGetRequest(honoInstance, '/api/states/switch.kitchen');
      const entity = await parseJsonResponse<Entity>(statesResponse);
      expect(entity.state).toBe('off');
    });
  });

  describe('GET /api/events', () => {
    it('should return SSE stream', async () => {
      const response = await makeGetRequest(honoInstance, '/api/events');
      assertResponseStatus(response, 200);

      assertHeaderValue(response, 'Content-Type', 'text/event-stream');
      assertHeaderValue(response, 'Cache-Control', 'no-cache');
      assertHeaderValue(response, 'Connection', 'keep-alive');

      const text = await response.text();
      expect(text).toContain('data: {"type":"connected"}');
    });
  });

  describe('IAppMock interface compliance', () => {
    it('should have name property', () => {
      expect(handler.name).toBe('home-assistant');
    });

    it('should have version property', () => {
      expect(handler.version).toBe('2026.2.1');
    });

    it('should have basePath property', () => {
      expect(handler.basePath).toBe('/api');
    });

    it('should have registerRoutes method', () => {
      expect(typeof handler.registerRoutes).toBe('function');
    });
  });

  describe('EntityFactory tests', () => {
    it('should create light entity with default values', () => {
      const entity = EntityFactory.createLight();
      expect(entity.entity_id).toBe('light.test_light');
      expect(entity.state).toBe('off');
      expect(entity.attributes.friendly_name).toBe('Test Light');
    });

    it('should create entity with overrides', () => {
      const entity = EntityFactory.createLight({
        entity_id: 'light.custom',
        state: 'on',
      });
      expect(entity.entity_id).toBe('light.custom');
      expect(entity.state).toBe('on');
    });

    it('should create entity with state helper', () => {
      const stateOverride = EntityFactory.withState('on');
      const entity = EntityFactory.createEntity(stateOverride);
      expect(entity.state).toBe('on');
    });

    it('should create entity with brightness helper', () => {
      const brightnessOverride = EntityFactory.withBrightness(100);
      const entity = EntityFactory.createEntity(brightnessOverride);
      expect(entity.attributes.brightness).toBe(100);
    });
  });

  describe('ServiceCallFactory tests', () => {
    it('should create turn_on light request', () => {
      const request = ServiceCallFactory.createTurnOnLightRequest('light.test');
      expect(request.domain).toBe('light');
      expect(request.service).toBe('turn_on');
      expect(request.service_data?.entity_id).toBe('light.test');
    });

    it('should create custom service request', () => {
      const request = ServiceCallFactory.createCustomServiceRequest('media_player', 'play', {
        entity_id: 'media_player.speaker',
        volume_level: 0.5,
      });
      expect(request.domain).toBe('media_player');
      expect(request.service).toBe('play');
      expect(request.service_data?.entity_id).toBe('media_player.speaker');
    });
  });
});
