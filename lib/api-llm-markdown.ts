import { readFileSync } from 'node:fs';
import path from 'node:path';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

interface OperationRef {
  path: string;
  method: HttpMethod;
}

interface OpenAPISpec {
  servers?: { url: string; description?: string }[];
  security?: Record<string, unknown>[];
  paths?: Record<string, Partial<Record<HttpMethod, OperationObject>>>;
  components?: {
    parameters?: Record<string, ParameterObject>;
    responses?: Record<string, ResponseObject>;
    securitySchemes?: Record<string, { description?: string }>;
  };
}

interface OperationObject {
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
  security?: Record<string, unknown>[];
}

interface ParameterObject {
  $ref?: string;
  name?: string;
  in?: string;
  required?: boolean;
  description?: string;
  example?: unknown;
  schema?: SchemaObject;
}

interface RequestBodyObject {
  $ref?: string;
  description?: string;
  required?: boolean;
  content?: Record<
    string,
    {
      schema?: SchemaObject;
      example?: unknown;
    }
  >;
}

interface ResponseObject {
  $ref?: string;
  description?: string;
  content?: Record<
    string,
    {
      schema?: SchemaObject;
      example?: unknown;
    }
  >;
}

interface SchemaObject {
  $ref?: string;
  type?: string;
  description?: string;
  enum?: unknown[];
  default?: unknown;
  example?: unknown;
  format?: string;
  nullable?: boolean;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
}

let cachedSpec: OpenAPISpec | null = null;

function getSpec(): OpenAPISpec {
  if (!cachedSpec) {
    const file = path.join(process.cwd(), 'openapi.json');
    cachedSpec = JSON.parse(readFileSync(file, 'utf-8')) as OpenAPISpec;
  }
  return cachedSpec;
}

function resolveRef<T>(ref: string): T {
  const spec = getSpec();
  const pointer = ref.replace(/^#\//, '').split('/');
  let current: unknown = spec;
  for (const segment of pointer) {
    if (typeof current !== 'object' || current === null) {
      throw new Error(`Unable to resolve ref: ${ref}`);
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current as T;
}

function dereference<T extends { $ref?: string }>(value: T): T {
  if (value.$ref) {
    return dereference(resolveRef<T>(value.$ref));
  }
  return value;
}

export function isApiEndpointPage(url: string): boolean {
  return url.startsWith('/api/endpoint/');
}

export function parseOperationsFromMdx(raw: string): OperationRef[] {
  const match = raw.match(/operations=\{(\[[\s\S]*?\])\}/);
  if (!match) return [];

  try {
    const operations = JSON.parse(match[1]) as OperationRef[];
    return operations.filter(
      (operation) =>
        typeof operation.path === 'string' &&
        typeof operation.method === 'string',
    );
  } catch {
    return [];
  }
}

export function stripGeneratedNoise(markdown: string): string {
  return markdown
    .replace(/\{\/\*[\s\S]*?\*\/\}\n?/g, '')
    .replace(/<APIPage\b[^>]*\/>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function schemaType(schema: SchemaObject | undefined): string {
  if (!schema) return 'unknown';
  if (schema.type === 'array') {
    return `array<${schemaType(schema.items)}>`;
  }
  if (schema.type) return schema.type;
  if (schema.enum) return 'enum';
  return 'unknown';
}

function formatSchemaDetails(schema: SchemaObject | undefined): string[] {
  if (!schema) return [];

  const resolved = dereference(schema);
  const details: string[] = [`- Type: \`${schemaType(resolved)}\``];

  if (resolved.format) details.push(`- Format: \`${resolved.format}\``);
  if (resolved.default !== undefined) {
    details.push(`- Default: \`${JSON.stringify(resolved.default)}\``);
  }
  if (resolved.enum?.length) {
    details.push(
      `- Allowed values: ${resolved.enum.map((value) => `\`${JSON.stringify(value)}\``).join(', ')}`,
    );
  }
  if (resolved.example !== undefined) {
    details.push(`- Example: \`${JSON.stringify(resolved.example)}\``);
  }
  if (resolved.minimum !== undefined) details.push(`- Minimum: ${resolved.minimum}`);
  if (resolved.maximum !== undefined) details.push(`- Maximum: ${resolved.maximum}`);
  if (resolved.minLength !== undefined) {
    details.push(`- Min length: ${resolved.minLength}`);
  }
  if (resolved.maxLength !== undefined) {
    details.push(`- Max length: ${resolved.maxLength}`);
  }
  if (resolved.nullable) details.push('- Nullable: true');

  return details;
}

function formatParameter(parameter: ParameterObject): string {
  const resolved = dereference(parameter);
  const required = resolved.required ? 'required' : 'optional';
  const lines = [`#### ${resolved.name} (${required})`];

  if (resolved.description) lines.push(resolved.description);
  lines.push(...formatSchemaDetails(resolved.schema));

  if (resolved.example !== undefined) {
    lines.push(`- Example: \`${JSON.stringify(resolved.example)}\``);
  }

  return lines.join('\n');
}

function formatRequestBody(requestBody: RequestBodyObject): string {
  const resolved = dereference(requestBody);
  const sections: string[] = ['### Request Body'];

  if (resolved.description) sections.push(resolved.description);

  for (const [mediaType, content] of Object.entries(resolved.content ?? {})) {
    const mediaSections: string[] = [`#### ${mediaType}`];

    const schema = content.schema ? dereference(content.schema) : undefined;
    if (schema?.properties) {
      for (const [name, property] of Object.entries(schema.properties)) {
        const prop = dereference(property);
        const required = schema.required?.includes(name) ? 'required' : 'optional';
        const propertyLines = [`##### ${name} (${required})`];
        if (prop.description) propertyLines.push(prop.description);
        propertyLines.push(...formatSchemaDetails(prop));
        mediaSections.push(propertyLines.join('\n'));
      }
    }

    if (content.example !== undefined) {
      mediaSections.push(
        ['Example:', '```json', JSON.stringify(content.example, null, 2), '```'].join('\n'),
      );
    }

    sections.push(mediaSections.join('\n\n'));
  }

  return sections.join('\n\n');
}

function getResponseExample(response: ResponseObject): unknown | undefined {
  const resolved = dereference(response);
  const json = resolved.content?.['application/json'];
  if (!json) return undefined;
  if (json.example !== undefined) return json.example;

  const messageExample = json.schema?.properties?.message?.example;
  if (messageExample !== undefined) {
    return { message: messageExample };
  }

  return undefined;
}

function formatResponse(status: string, response: ResponseObject): string {
  const resolved = dereference(response);
  const mediaType = resolved.content
    ? Object.keys(resolved.content)[0]
    : 'application/json';
  const lines = [`#### ${status} ${mediaType}`, ''];

  if (resolved.description) lines.push(resolved.description, '');

  const example = getResponseExample(resolved);
  if (example !== undefined) {
    lines.push('```json', JSON.stringify(example, null, 2), '```');
  }

  return lines.join('\n').trim();
}

function formatAuthorization(): string {
  const spec = getSpec();
  const scheme = spec.components?.securitySchemes?.bearerAuth;
  if (!scheme?.description) return '';

  return ['### Authorization', '', scheme.description, '', '**In:** header'].join('\n');
}

function generateOperationMarkdown(pathname: string, method: HttpMethod): string {
  const spec = getSpec();
  const operation = spec.paths?.[pathname]?.[method];
  if (!operation) {
    return `## ${method.toUpperCase()} ${pathname}\n\nOperation not found in OpenAPI spec.`;
  }

  const serverUrl = spec.servers?.[0]?.url ?? 'https://app.buildstash.com/api/v1';
  const sections: string[] = [
    `## ${method.toUpperCase()} ${pathname}`,
    operation.description ?? operation.summary ?? '',
    `**Base URL:** \`${serverUrl}\``,
  ].filter((line) => line.length > 0);

  const auth = formatAuthorization();
  if (auth) sections.push(auth);

  const pathParams = (operation.parameters ?? [])
    .map((parameter) => dereference(parameter))
    .filter((parameter) => parameter.in === 'path');
  const queryParams = (operation.parameters ?? [])
    .map((parameter) => dereference(parameter))
    .filter((parameter) => parameter.in === 'query');
  const headerParams = (operation.parameters ?? [])
    .map((parameter) => dereference(parameter))
    .filter((parameter) => parameter.in === 'header');

  if (pathParams.length > 0) {
    sections.push(
      '### Path Parameters',
      ...pathParams.map(formatParameter),
    );
  }
  if (queryParams.length > 0) {
    sections.push(
      '### Query Parameters',
      ...queryParams.map(formatParameter),
    );
  }
  if (headerParams.length > 0) {
    sections.push(
      '### Header Parameters',
      ...headerParams.map(formatParameter),
    );
  }
  if (operation.requestBody) {
    sections.push(formatRequestBody(operation.requestBody));
  }

  if (operation.responses && Object.keys(operation.responses).length > 0) {
    sections.push('### Response Body');
    for (const [status, response] of Object.entries(operation.responses)) {
      sections.push(formatResponse(status, response));
    }
  }

  return sections.join('\n\n').trim();
}

export async function generateApiEndpointLLMMarkdown(options: {
  title: string;
  url: string;
  raw: string;
  processed: string;
}): Promise<string> {
  const intro = stripGeneratedNoise(options.processed);
  const operations = parseOperationsFromMdx(options.raw);
  const operationSections = operations.map((operation) =>
    generateOperationMarkdown(operation.path, operation.method),
  );

  const sections = [`# ${options.title} (${options.url})`, ''];
  if (intro) sections.push(intro, '');
  if (operationSections.length > 0) {
    sections.push(operationSections.join('\n\n'));
  }

  return sections.join('\n').trim();
}
