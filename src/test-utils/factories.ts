import type { Entity, ServiceCallRequest } from '../types.js';

export class EntityFactory {
  static createLight(overrides?: Partial<Entity>): Entity {
    return {
      entity_id: 'light.test_light',
      state: 'off',
      attributes: {
        friendly_name: 'Test Light',
        supported_color_modes: ['brightness'],
        brightness: 0,
      },
      last_changed: '2024-01-15T10:00:00Z',
      last_updated: '2024-01-15T10:00:00Z',
      context: {
        id: '01J4A2B3C4D5E6F7G8H9I0J1',
        user_id: null,
        parent_id: null,
      },
      ...overrides,
    };
  }

  static createSwitch(overrides?: Partial<Entity>): Entity {
    return {
      entity_id: 'switch.test_switch',
      state: 'off',
      attributes: {
        friendly_name: 'Test Switch',
      },
      last_changed: '2024-01-15T10:00:00Z',
      last_updated: '2024-01-15T10:00:00Z',
      context: {
        id: '01J4A2B3C4D5E6F7G8H9I0J2',
        user_id: null,
        parent_id: null,
      },
      ...overrides,
    };
  }

  static createSensor(overrides?: Partial<Entity>): Entity {
    return {
      entity_id: 'sensor.test_sensor',
      state: '0',
      attributes: {
        friendly_name: 'Test Sensor',
        unit_of_measurement: '',
      },
      last_changed: '2024-01-15T10:00:00Z',
      last_updated: '2024-01-15T10:00:00Z',
      context: {
        id: '01J4A2B3C4D5E6F7G8H9I0J3',
        user_id: null,
        parent_id: null,
      },
      ...overrides,
    };
  }

  static createEntity(overrides?: Partial<Entity>): Entity {
    return {
      entity_id: 'entity.test',
      state: 'unknown',
      attributes: {
        friendly_name: 'Test Entity',
      },
      last_changed: '2024-01-15T10:00:00Z',
      last_updated: '2024-01-15T10:00:00Z',
      context: {
        id: '01J4A2B3C4D5E6F7G8H9I0J4',
        user_id: null,
        parent_id: null,
      },
      ...overrides,
    };
  }

  static withState(state: string): Partial<Entity> {
    return { state };
  }

  static withBrightness(brightness: number): Partial<Entity> {
    return {
      attributes: {
        friendly_name: 'Test Light',
        supported_color_modes: ['brightness'],
        brightness,
      },
    };
  }

  static withCustomAttribute(key: string, value: unknown): Partial<Entity> {
    return {
      attributes: {
        friendly_name: 'Test Entity',
        [key]: value,
      },
    };
  }
}

export class ServiceCallFactory {
  static createTurnOnLightRequest(entityId: string, serviceData?: Record<string, unknown>): ServiceCallRequest {
    return {
      domain: 'light',
      service: 'turn_on',
      service_data: {
        entity_id: entityId,
        ...serviceData,
      },
    };
  }

  static createTurnOffLightRequest(entityId: string): ServiceCallRequest {
    return {
      domain: 'light',
      service: 'turn_off',
      service_data: {
        entity_id: entityId,
      },
    };
  }

  static createTurnOnSwitchRequest(entityId: string): ServiceCallRequest {
    return {
      domain: 'switch',
      service: 'turn_on',
      service_data: {
        entity_id: entityId,
      },
    };
  }

  static createTurnOffSwitchRequest(entityId: string): ServiceCallRequest {
    return {
      domain: 'switch',
      service: 'turn_off',
      service_data: {
        entity_id: entityId,
      },
    };
  }

  static createCustomServiceRequest(domain: string, service: string, serviceData?: Record<string, unknown>): ServiceCallRequest {
    return {
      domain,
      service,
      service_data: serviceData || {},
    };
  }

  static withoutEntityId(domain: string, service: string): ServiceCallRequest {
    return {
      domain,
      service,
      service_data: {},
    };
  }
}
