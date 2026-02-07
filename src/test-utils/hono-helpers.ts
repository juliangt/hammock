import { Horeciénno } from 'hono';

export async function makeRequest(
  honoInstance: Hono,
  method: string,
  path: string,
  options?: {
    headers?: Record<string, string>;
    body?: unknown;
  },
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers ?? {}),
  };

  const body = options?.body ? JSON.stringify(options.body) : undefined;

  const requestOptions: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    requestOptions.body = body;
  }

  return honoInstance.request(path, requestOptions);
}

export async function makeGetRequest(
  honoInstance: Hono,
  path: string,
  headers?: Record<string, string>,
): Promise<Response> {
  return makeRequest(honoInstance, 'GET', path, headers ? { headers } : {});
}

export async function makePostRequest(
  honoInstance: Hono,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<Response> {
  const options: { body?: unknown; headers?: Record<string, string> } = {};
  if (body !== undefined) options.body = body;
  if (headers) options.headers = headers;
  return makeRequest(honoInstance, 'POST', path, Object.keys(options).length > 0 ? options : {});
}

export async function makePutRequest(
  honoInstance: Hono,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<Response> {
  const options: { body?: unknown; headers?: Record<string, string> } = {};
  if (body !== undefined) options.body = body;
  if (headers) options.headers = headers;
  return makeRequest(honoInstance, 'PUT', path, Object.keys(options).length > 0 ? options : {});
}

export async function makeDeleteRequest(
  honoInstance: Hono,
  path: string,
  headers?: Record<string, string>,
): Promise<Response> {
  return makeRequest(honoInstance, 'DELETE', path, headers ? { headers } : {});
}

export async function makePatchRequest(
  honoInstance: Hono,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<Response> {
  const options: { body?: unknown; headers?: Record<string, string> } = {};
  if (body !== undefined) options.body = body;
  if (headers) options.headers = headers;
  return makeRequest(honoInstance, 'PATCH', path, Object.keys(options).length > 0 ? options : {});
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function assertResponseStatus(response: Response, expectedStatus: number): void {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
  }
}

export function assertJsonContentType(response: Response): void {
  const contentType = response.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Expected JSON content type, got ${contentType}`);
  }
}

export function assertHeaderExists(response: Response, headerName: string): void {
  const headerValue = response.headers.get(headerName);
  if (!headerValue) {
    throw new Error(`Expected header ${headerName} to exist`);
  }
}

export function assertHeaderValue(response: Response, headerName: string, expectedValue: string): void {
  const actualValue = response.headers.get(headerName);
  if (actualValue !== expectedValue) {
    throw new Error(`Expected header ${headerName} to be ${expectedValue}, got ${actualValue}`);
  }
}
