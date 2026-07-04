import { createOpenAPI } from 'fumadocs-openapi/server';
import path from 'node:path';

export const openapi = createOpenAPI({
  input: ['./openapi.json'],
  disableCache: process.env.NODE_ENV === 'development',
  //proxyUrl: '/api/proxy',
});