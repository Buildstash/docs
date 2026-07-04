import { doubleQuote } from './utils';

export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function phpQuote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function appendStructuredEntry(
  lines: string[],
  depth: number,
  value: unknown,
  formatValue: (value: unknown) => string[],
  key?: string,
  quoteKey?: (key: string) => string,
): void {
  const pad = '  '.repeat(depth);
  const itemLines = formatValue(value);
  const prefix =
    key !== undefined ? `${quoteKey ? quoteKey(key) : doubleQuote(key)}: ` : '';

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

function structuredValueLines(
  value: unknown,
  options: {
    quoteString: (value: string) => string;
    formatNull: () => string;
    formatBoolean: (value: boolean) => string;
    quoteKey?: (key: string) => string;
    emptyObject: string;
    objectOpen: string;
    objectClose: string;
  },
): string[] {
  if (value === null) return [options.formatNull()];
  if (typeof value === 'boolean') return [options.formatBoolean(value)];
  if (typeof value === 'number') return [String(value)];
  if (typeof value === 'string') return [options.quoteString(value)];

  if (Array.isArray(value)) {
    if (value.length === 0) return ['[]'];
    const lines = ['['];
    for (const item of value) {
      appendStructuredEntry(lines, 1, item, (itemValue) =>
        structuredValueLines(itemValue, options),
      );
    }
    lines.push(']');
    return lines;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return [options.emptyObject];

  const lines = [options.objectOpen];
  for (const [key, item] of entries) {
    appendStructuredEntry(
      lines,
      1,
      item,
      (itemValue) => structuredValueLines(itemValue, options),
      key,
      options.quoteKey,
    );
  }
  lines.push(options.objectClose);
  return lines;
}

export function pythonDictLines(value: unknown): string[] {
  return structuredValueLines(value, {
    quoteString: (item) => doubleQuote(item),
    formatNull: () => 'None',
    formatBoolean: (item) => (item ? 'True' : 'False'),
    quoteKey: doubleQuote,
    emptyObject: '{}',
    objectOpen: '{',
    objectClose: '}',
  });
}

export function phpValueLines(value: unknown): string[] {
  return structuredValueLines(value, {
    quoteString: phpQuote,
    formatNull: () => 'null',
    formatBoolean: (item) => (item ? 'true' : 'false'),
    quoteKey: phpQuote,
    emptyObject: '[]',
    objectOpen: '[',
    objectClose: ']',
  });
}
