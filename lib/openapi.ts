import { createOpenAPI } from 'fumadocs-openapi/server';
import path from 'node:path';

export const openapi = createOpenAPI({
  input: ['./openapi.json'],
  //proxyUrl: '/api/proxy',
});