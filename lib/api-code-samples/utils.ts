import type { CodeUsageGeneratorFn } from 'fumadocs-openapi/requests/generators';

export interface EncodedParameter {
  readonly value: string;
}

export interface EncodedParameterMultiple {
  readonly values: string[];
}

export interface RequestData {
  method: string;
  path: Record<string, EncodedParameter>;
  query: Record<string, EncodedParameterMultiple>;
  header: Record<string, EncodedParameter>;
  cookie: Record<string, EncodedParameter>;
  body?: unknown;
  bodyMediaType?: string;
}

export type SampleRequestData = RequestData & { url: string };

export type ApiCodeGenerator = {
  label: string;
  lang: string;
  generate: CodeUsageGeneratorFn;
};

export function toCamelCase(name: string): string {
  return name.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function indent(code: string, tabs = 1): string {
  const prefix = '  '.repeat(tabs);
  return code
    .split('\n')
    .map((line) => (line.length === 0 ? line : prefix + line))
    .join('\n');
}

export function doubleQuote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function singleQuote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function extractBaseUrl(url: URL): string {
  const match = url.pathname.match(/^(\/api\/v\d+)/);
  if (match) {
    return `${url.origin}${match[1]}`;
  }

  return url.origin;
}

export function buildRequestParts(data: SampleRequestData): RequestParts {
  const url = new URL(data.url);
  const baseUrl = extractBaseUrl(url);
  const basePath = new URL(baseUrl).pathname;
  const path = url.pathname.slice(basePath.length) || '/';

  const pathVars = Object.entries(data.path).map(([key, param]) => ({
    key,
    varName: toCamelCase(key),
    value: param.value,
  }));

  let pathTemplate = path;
  for (const { varName, value } of pathVars) {
    pathTemplate = pathTemplate.split(value).join(`{${varName}}`);
    const encoded = encodeURIComponent(value);
    if (encoded !== value) {
      pathTemplate = pathTemplate.split(encoded).join(`{${varName}}`);
    }
  }

  const queryParams = Object.entries(data.query)
    .filter(([, param]) => param.values.length > 0)
    .map(([key, param]) => ({
      key,
      value: param.values.join(','),
    }));

  const headers: Record<string, string> = {};
  for (const [key, param] of Object.entries(data.header)) {
    headers[key] = param.value;
  }

  if (!headers.Authorization && !headers.authorization) {
    headers.Authorization = 'Bearer YOUR_API_KEY';
  }

  const cookies: Record<string, string> = {};
  for (const [key, param] of Object.entries(data.cookie)) {
    cookies[key] = param.value;
  }

  return {
    baseUrl,
    pathTemplate,
    pathVars,
    queryParams,
    headers,
    cookies,
    method: data.method.toUpperCase(),
  };
}

export interface RequestParts {
  baseUrl: string;
  pathTemplate: string;
  pathVars: Array<{ key: string; varName: string; value: string }>;
  queryParams: Array<{ key: string; value: string }>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  method: string;
}

export function buildPathExpression(
  parts: RequestParts,
  style: 'js-template' | 'csharp-interpolation' | 'python-fstring' | 'go-format' | 'java-concat' | 'raw',
): string {
  let path = parts.pathTemplate;

  if (style === 'raw') {
    for (const { varName, value } of parts.pathVars) {
      path = path.replace(`{${varName}}`, value);
    }
    return path;
  }

  for (const { varName } of parts.pathVars) {
    const placeholder = `{${varName}}`;
    switch (style) {
      case 'js-template':
        path = path.replace(placeholder, `\${${varName}}`);
        break;
      case 'csharp-interpolation':
      case 'python-fstring':
        path = path.replace(placeholder, `{${varName}}`);
        break;
      case 'go-format':
        path = path.replace(placeholder, '%s');
        break;
      case 'java-concat':
        path = path.replace(placeholder, `" + ${varName} + "`);
        break;
    }
  }

  return path;
}
