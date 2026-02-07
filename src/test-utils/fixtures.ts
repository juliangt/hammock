import type { Entity, SystemConfig, ServiceCallRequest, ServiceResponse } from '../types.js';

export const mockSystemConfig: SystemConfig = {
  location_name: 'Mock Home',
  latitude: 40.4168,
  longitude: -3.7038,
  elevation: 667,
  unit_system: {
    length: 'm',
    mass: 'kg',
    temperature: '°C',
    volume: 'L',
  },
  timezone: 'Europe/Madrid',
  components: ['light', 'switch', 'sensor', 'binary_sensor', 'automation'],
  config_dir: '/config',
  version: '2026.2.1',
};

export const mockEntityLight: Entity = {
  entity_id: 'light.living_room',
  state: 'off',
  attributes: {
    friendly_name: 'Living Room',
    supported_color_modes: ['brightness', 'color_temp'],
    brightness: 255,
    color_temp: 370,
    min_color_temp: 153,
    max_color_temp: 500,
  },
  last_changed: '2024-01-15T10:00:00Z',
  last_updated: '2024-01-15T10:00:00Z',
  context: {
    id: '01J4A2B3C4D5E6F7G8H9I0J1',
    user_id: null,
    parent_id: null,
  },
};

export const mockEntitySwitch: Entity = {
  entity_id: 'switch.kitchen',
  state: 'off',
  attributes: {
    friendly_name: 'Kitchen Switch',
  },
  last_changed: '2024-01-15T10:00:00Z',
  last_updated: '2024-01-15T10:00:00Z',
  context: {
    id: '01J4A2B3C4D5E6F7G8H9I0J3',
    user_id: null,
    parent_id: null,
  },
};

export const mockEntitySensor: Entity = {
  entity_id: 'sensor.temperature_living',
  state: '22.5',
  attributes: {
    friendly_name: 'Living Room Temperature',
    unit_of_measurement: '°C',
    device_class: 'temperature',
  },
  last_changed: '2024-01-15T10:00:00Z',
  last_updated: '2024-01-15T10:00:00Z',
  context: {
    id: '01J4A2B3C4D5E6F7G8H9I0J4',
    user_id: null,
    parent_id: null,
  },
};

export const mockServiceResponse: ServiceResponse = {
  context: {
    id: 'test-context-id',
    parent_id: null,
    user_id: null,
  },
};

export const mockEntityBedroom: Entity = {
  entity_id: 'light.bedroom',
  state: 'off',
  attributes: {
    friendly_name: 'Bedroom',
    supported_color_modes: ['brightness'],
    brightness: 0,
  },
  last_changed: '2024-01-15T10:00:00Z',
  last_updated: '2024-01-15T10:00:00Z',
  context: {
    id: '01J4A2B3C4D5E6F7G8H9I0J2',
    user_id: null,
    parent_id: null,
  },
};

export const mockEntityHumidity: Entity = {
  entity_id: 'sensor.humidity_living',
  state: '45',
  attributes: {
    friendly_name: 'Living Room Humidity',
    unit_of_measurement: '%',
    device_class: 'humidity',
  },
  last_changed: '2024-01-15T10:00:00Z',
  last_updated: '2024-01-15T10:00:00Z',
  context: {
    id: '01J4A2B3C4D5E6F7G8H9I0J5',
    user_id: null,
    parent_id: null,
  },
};

export const mockEntityMotionDetector: Entity = {
  entity_id: 'sensor.motion_detector',
  state: 'off',
  attributes: {
    friendly_name: 'Motion Detector',
    device_class: 'motion',
  },
  last_changed: '2024-01-15T10:00:00Z',
  last_updated: '2024-01-15T10:00:00Z',
  context: {
    id: '01J4A2B3C4D5E6F7G8H9I0J6',
    user_id: null,
    parent_id: null,
  },
};

export const mockStates: Record<string, Entity> = {
  'light.living_room': mockEntityLight,
  'light.bedroom': mockEntityBedroom,
  'switch.kitchen': mockEntitySwitch,
  'sensor.temperature_living': mockEntitySensor,
  'sensor.humidity_living': mockEntityHumidity,
  'sensor.motion_detector': mockEntityMotionDetector,
};
