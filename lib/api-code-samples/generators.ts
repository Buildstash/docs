import { generateBody } from './body';
import {
  buildPathExpression,
  buildRequestParts,
  doubleQuote,
  indent,
  singleQuote,
  type ApiCodeGenerator,
  type SampleRequestData,
} from './utils';

function pythonLiteral(value: unknown): string {
  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return doubleQuote(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => pythonLiteral(item)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, item]) => `${doubleQuote(key)}: ${pythonLiteral(item)}`,
    );
    return `{${entries.join(', ')}}`;
  }
  return doubleQuote(String(value));
}

function phpQuote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function phpValueLines(value: unknown): string[] {
  if (value === null) return ['null'];
  if (typeof value === 'boolean') return [value ? 'true' : 'false'];
  if (typeof value === 'number') return [String(value)];
  if (typeof value === 'string') return [phpQuote(value)];

  if (Array.isArray(value)) {
    if (value.length === 0) return ['[]'];
    const lines = ['['];
    for (const item of value) {
      appendPhpEntry(lines, 1, item);
    }
    lines.push(']');
    return lines;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return ['[]'];

  const lines = ['['];
  for (const [key, item] of entries) {
    appendPhpEntry(lines, 1, item, key);
  }
  lines.push(']');
  return lines;
}

function appendPhpEntry(
  lines: string[],
  depth: number,
  value: unknown,
  key?: string,
): void {
  const pad = '  '.repeat(depth);
  const itemLines = phpValueLines(value);
  const prefix = key !== undefined ? `${phpQuote(key)} => ` : '';

  if (itemLines.length === 1) {
    lines.push(`${pad}${prefix}${itemLines[0]},`);
    return;
  }

  lines.push(`${pad}${prefix}${itemLines[0]}`);
  for (let i = 1; i < itemLines.length - 1; i++) {
    lines.push(`${pad}${itemLines[i]}`);
  }
  lines.push(`${pad}${itemLines[itemLines.length - 1]},`);
}

const curl: ApiCodeGenerator = {
  label: 'cURL',
  lang: 'bash',
  generate(data: SampleRequestData) {
    const parts = buildRequestParts(data);
    const path = buildPathExpression(parts, 'raw');
    const isGet = parts.method === 'GET';
    const hasQuery = parts.queryParams.length > 0;
    let url = `${parts.baseUrl}${path}`;

    const lines: string[] = [];

    if (isGet && hasQuery) {
      lines.push(`curl -X GET -G ${doubleQuote(url)}`);
      for (const { key, value } of parts.queryParams) {
        lines.push(`--data-urlencode ${doubleQuote(`${key}=${value}`)}`);
      }
    } else {
      if (hasQuery) {
        const query = parts.queryParams
          .map(
            ({ key, value }) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          )
          .join('&');
        url = `${url}?${query}`;
      }
      lines.push(`curl -X ${parts.method} ${doubleQuote(url)}`);
    }

    for (const [key, value] of Object.entries(parts.headers)) {
      lines.push(`-H ${doubleQuote(`${key}: ${value}`)}`);
    }

    if (data.body && data.bodyMediaType === 'application/json') {
      lines.push(`-H ${doubleQuote('Content-Type: application/json')}`);
      lines.push(`-d ${singleQuote(JSON.stringify(data.body))}`);
    }

    if (Object.keys(parts.cookies).length > 0) {
      const cookie = Object.entries(parts.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      lines.push(`--cookie ${doubleQuote(cookie)}`);
    }

    return lines.map((line, index) => indent(line, index > 0 ? 1 : 0)).join(' \\\n');
  },
};

const javascript: ApiCodeGenerator = {
  label: 'JavaScript',
  lang: 'js',
  generate(data: SampleRequestData) {
    const parts = buildRequestParts(data);
    const lines: string[] = [`const baseUrl = ${singleQuote(parts.baseUrl)};`];

    for (const { varName, value } of parts.pathVars) {
      lines.push(`const ${varName} = ${singleQuote(value)};`);
    }

    if (parts.queryParams.length > 0) {
      lines.push('const params = new URLSearchParams();');
      for (const { key, value } of parts.queryParams) {
        lines.push(`params.set(${singleQuote(key)}, ${singleQuote(value)});`);
      }
    }

    const pathWithTemplate = buildPathExpression(parts, 'js-template');
    lines.push(
      parts.queryParams.length > 0
        ? `const url = \`\${baseUrl}${pathWithTemplate}?\${params}\`;`
        : `const url = \`\${baseUrl}${pathWithTemplate}\`;`,
    );

    const body = generateBody(data, 'js');
    if (body) lines.push('', body);

    const headerEntries = Object.entries(parts.headers);
    if (data.body && data.bodyMediaType === 'application/json') {
      headerEntries.push(['Content-Type', 'application/json']);
    }

    const options: string[] = [`method: ${singleQuote(parts.method)}`];
    if (headerEntries.length > 0) {
      options.push(
        `headers: {\n${headerEntries
          .map(([key, value]) => indent(`${singleQuote(key)}: ${singleQuote(value)}`, 2))
          .join(',\n')}\n${indent('}', 1)}`,
      );
    }
    if (body) options.push('body');

    lines.push('', `const response = await fetch(url, {\n${indent(options.join(',\n'))}\n});`);
    lines.push('const result = await response.json();');
    lines.push('console.log(result);');

    return lines.join('\n');
  },
};

const python: ApiCodeGenerator = {
  label: 'Python',
  lang: 'python',
  generate(data: SampleRequestData) {
    const parts = buildRequestParts(data);
    const lines = ['import requests', ''];

    lines.push(`base_url = ${doubleQuote(parts.baseUrl)}`);
    for (const { varName, value } of parts.pathVars) {
      lines.push(`${varName} = ${doubleQuote(value)}`);
    }

    lines.push(`path = f"${buildPathExpression(parts, 'python-fstring')}"`);

    if (parts.queryParams.length > 0) {
      lines.push('params = {');
      for (const { key, value } of parts.queryParams) {
        lines.push(indent(`${doubleQuote(key)}: ${doubleQuote(value)},`));
      }
      lines.push('}');
    }

    if (Object.keys(parts.headers).length > 0) {
      lines.push('headers = {');
      for (const [key, value] of Object.entries(parts.headers)) {
        lines.push(indent(`${doubleQuote(key)}: ${doubleQuote(value)},`));
      }
      lines.push('}');
    }

    const requestArgs = [doubleQuote(parts.method), 'f"{base_url}{path}"'];
    if (parts.queryParams.length > 0) requestArgs.push('params=params');
    if (Object.keys(parts.headers).length > 0) requestArgs.push('headers=headers');

    if (data.body && data.bodyMediaType === 'application/json') {
      requestArgs.push(`json=${pythonLiteral(data.body)}`);
    } else {
      const body = generateBody(data, 'python');
      if (body) {
        lines.push('');
        lines.push(body);
        requestArgs.push('data=body');
      }
    }

    lines.push('', `response = requests.request(${requestArgs.join(', ')})`);
    lines.push('print(response.json())');

    return lines.join('\n');
  },
};

const php: ApiCodeGenerator = {
  label: 'PHP',
  lang: 'php',
  generate(data: SampleRequestData) {
    const parts = buildRequestParts(data);
    const lines = [
      '<?php',
      '',
      "require 'vendor/autoload.php';",
      '',
      '$client = new GuzzleHttp\\Client([',
      indent(`'base_uri' => ${doubleQuote(`${parts.baseUrl}/`)},`),
      ']);',
      '',
    ];

    for (const { varName, value } of parts.pathVars) {
      lines.push(`$${varName} = ${doubleQuote(value)};`);
    }

    let path = parts.pathTemplate;
    for (const { varName } of parts.pathVars) {
      path = path.replace(`{${varName}}`, `{$${varName}}`);
    }
    lines.push(`$path = "${path}";`);

    lines.push('$options = [');
    lines.push(indent("'headers' => ["));
    for (const [key, value] of Object.entries(parts.headers)) {
      lines.push(indent(`${doubleQuote(key)} => ${doubleQuote(value)},`, 2));
    }
    lines.push(indent('],'));

    if (parts.queryParams.length > 0) {
      lines.push(indent("'query' => ["));
      for (const { key, value } of parts.queryParams) {
        lines.push(indent(`${doubleQuote(key)} => ${doubleQuote(value)},`, 2));
      }
      lines.push(indent('],'));
    }

    if (data.body && data.bodyMediaType === 'application/json') {
      const bodyLines = phpValueLines(data.body);
      lines.push(indent(`'json' => ${bodyLines[0]}`));
      for (let i = 1; i < bodyLines.length; i++) {
        const line = bodyLines[i];
        lines.push(i === bodyLines.length - 1 ? indent(`${line},`) : indent(line));
      }
    }

    lines.push('];');
    lines.push('');
    lines.push(`$response = $client->request(${doubleQuote(parts.method)}, $path, $options);`);
    lines.push('echo $response->getBody();');

    return lines.join('\n');
  },
};

const csharp: ApiCodeGenerator = {
  label: 'C#',
  lang: 'csharp',
  generate(data: SampleRequestData) {
    const parts = buildRequestParts(data);
    const lines = [
      'using System.Collections.Generic;',
      'using System.Linq;',
      'using System.Net.Http.Headers;',
      'using System.Text;',
      '',
      `var baseUrl = ${doubleQuote(parts.baseUrl)};`,
    ];

    for (const { varName, value } of parts.pathVars) {
      lines.push(`var ${varName} = ${doubleQuote(value)};`);
    }

    const pathWithTemplate = buildPathExpression(parts, 'csharp-interpolation');
    if (parts.queryParams.length > 0) {
      lines.push('var query = string.Join("&", new Dictionary<string, string>');
      lines.push('{');
      for (const { key, value } of parts.queryParams) {
        lines.push(indent(`[${doubleQuote(key)}] = ${doubleQuote(value)},`));
      }
      lines.push(`}.Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"));`);
      lines.push(`var url = $"{baseUrl}${pathWithTemplate}?" + query;`);
    } else {
      lines.push(`var url = $"{baseUrl}${pathWithTemplate}";`);
    }

    const body = generateBody(data, 'csharp');
    if (body) {
      lines.push('');
      lines.push(body);
    }

    lines.push('');
    lines.push('using var client = new HttpClient();');
    lines.push(
      'client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "YOUR_API_KEY");',
    );

    for (const [key, value] of Object.entries(parts.headers)) {
      if (key.toLowerCase() === 'authorization') continue;
      lines.push(`client.DefaultRequestHeaders.Add(${doubleQuote(key)}, ${doubleQuote(value)});`);
    }

    const method = parts.method[0] + parts.method.slice(1).toLowerCase() + 'Async';
    lines.push(
      body
        ? `var response = await client.${method}(url, body);`
        : `var response = await client.${method}(url);`,
    );
    lines.push('var responseBody = await response.Content.ReadAsStringAsync();');

    return lines.join('\n');
  },
};

const go: ApiCodeGenerator = {
  label: 'Go',
  lang: 'go',
  generate(data: SampleRequestData) {
    const parts = buildRequestParts(data);
    const body = generateBody(data, 'go');
    const imports = ['fmt', 'io', 'net/http', 'net/url'];
    if (body) imports.push('strings');

    const lines = [
      'package main',
      '',
      'import (',
      indent(imports.map((item) => doubleQuote(item)).join('\n')),
      ')',
      '',
      'func main() {',
      indent(`baseURL := ${doubleQuote(parts.baseUrl)}`),
    ];

    for (const { varName, value } of parts.pathVars) {
      lines.push(indent(`${varName} := ${doubleQuote(value)}`));
    }

    const pathTemplate = buildPathExpression(parts, 'go-format');
    if (parts.pathVars.length > 0) {
      lines.push(
        indent(
          `path := fmt.Sprintf(${doubleQuote(pathTemplate)}, ${parts.pathVars.map(({ varName }) => varName).join(', ')})`,
        ),
      );
    } else {
      lines.push(indent(`path := ${doubleQuote(parts.pathTemplate)}`));
    }

    if (parts.queryParams.length > 0) {
      lines.push(indent('params := url.Values{}'));
      for (const { key, value } of parts.queryParams) {
        lines.push(indent(`params.Set(${doubleQuote(key)}, ${doubleQuote(value)})`));
      }
      lines.push(indent('requestURL := baseURL + path + "?" + params.Encode()'));
    } else {
      lines.push(indent('requestURL := baseURL + path'));
    }

    if (body) lines.push(indent(body));

    lines.push(
      indent(
        `req, _ := http.NewRequest(${doubleQuote(parts.method)}, requestURL, ${body ? 'body' : 'nil'})`,
      ),
    );

    for (const [key, value] of Object.entries(parts.headers)) {
      lines.push(indent(`req.Header.Set(${doubleQuote(key)}, ${doubleQuote(value)})`));
    }

    if (body) {
      lines.push(
        indent(
          `req.Header.Set(${doubleQuote('Content-Type')}, ${doubleQuote('application/json')})`,
        ),
      );
    }

    lines.push(
      indent('resp, _ := http.DefaultClient.Do(req)'),
      indent('defer resp.Body.Close()'),
      indent('responseBody, _ := io.ReadAll(resp.Body)'),
      indent('fmt.Println(string(responseBody))'),
      '}',
    );

    return lines.join('\n');
  },
};

const java: ApiCodeGenerator = {
  label: 'Java',
  lang: 'java',
  generate(data: SampleRequestData) {
    const parts = buildRequestParts(data);
    const lines = [
      'import java.net.URI;',
      'import java.net.URLEncoder;',
      'import java.net.http.HttpClient;',
      'import java.net.http.HttpRequest;',
      'import java.net.http.HttpResponse;',
      'import java.nio.charset.StandardCharsets;',
      'import java.time.Duration;',
      '',
    ];

    const body = generateBody(data, 'java');
    if (body) lines.push(body, '');

    lines.push('HttpClient client = HttpClient.newBuilder()');
    lines.push(indent('.connectTimeout(Duration.ofSeconds(10))'));
    lines.push(indent('.build();'));
    lines.push('');

    for (const { varName, value } of parts.pathVars) {
      lines.push(`String ${varName} = ${doubleQuote(value)};`);
    }

    const pathWithTemplate = buildPathExpression(parts, 'java-concat');
    let urlExpression = `"${parts.baseUrl}" + "${pathWithTemplate}"`;
    if (parts.queryParams.length > 0) {
      const queryParts = parts.queryParams.map(
        ({ key, value }) =>
          `URLEncoder.encode(${doubleQuote(key)}, StandardCharsets.UTF_8) + "=" + URLEncoder.encode(${doubleQuote(value)}, StandardCharsets.UTF_8)`,
      );
      lines.push(`String query = ${queryParts.join(' + "&" + ')};`);
      urlExpression += ' + "?" + query';
    }
    lines.push(`String url = ${urlExpression};`);
    lines.push('');
    lines.push('HttpRequest request = HttpRequest.newBuilder()');
    lines.push(indent('.uri(URI.create(url))'));

    for (const [key, value] of Object.entries(parts.headers)) {
      lines.push(indent(`.header(${doubleQuote(key)}, ${doubleQuote(value)})`));
    }

    if (data.bodyMediaType) {
      lines.push(indent(`.header("Content-Type", ${doubleQuote(data.bodyMediaType)})`));
    }

    lines.push(indent(`.${parts.method}(${body ? 'body' : 'HttpRequest.BodyPublishers.noBody()'})`));
    lines.push(indent('.build();'));
    lines.push('');
    lines.push(
      'HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());',
    );
    lines.push('System.out.println(response.body());');

    return lines.join('\n');
  },
};

export const apiCodeGenerators = {
  curl,
  javascript,
  python,
  php,
  csharp,
  go,
  java,
};
