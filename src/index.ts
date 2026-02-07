import 'dotenv/config';
import { MockServer } from './core/Server.js';
import { HomeAssistantMock } from './apps/home-assistant/HAHandler.js';

const server = new MockServer();

server.registerApp(new HomeAssistantMock());

await server.start();
