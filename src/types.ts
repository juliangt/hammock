export interface ServiceCallRequest {
  domain: string;
  service: string;
  service_data?: Record<string, unknown>;
}

export interface Entity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    user_id: string | null;
    parent_id: string | null;
  };
}

export interface SystemConfig {
  location_name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  timezone: string;
  components: string[];
  config_dir: string;
  version: string;
}

export interface ServiceResponse {
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}
