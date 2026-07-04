import type { SampleRequestData } from './utils';
import { doubleQuote } from './utils';

type BodyLang = 'js' | 'python' | 'csharp' | 'go' | 'java';

function jsonLiteral(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function generateBody(data: SampleRequestData, lang: BodyLang): string | undefined {
  if (!data.body || !data.bodyMediaType) {
    return undefined;
  }

  if (data.bodyMediaType !== 'application/json') {
    return undefined;
  }

  switch (lang) {
    case 'js':
      return `const body = JSON.stringify(${jsonLiteral(data.body)});`;
    case 'python':
      return undefined;
    case 'csharp':
      return `var body = new StringContent(${doubleQuote(JSON.stringify(data.body))}, Encoding.UTF8, "application/json");`;
    case 'go':
      return `body := strings.NewReader(${doubleQuote(JSON.stringify(data.body))})`;
    case 'java':
      return `var body = HttpRequest.BodyPublishers.ofString(${doubleQuote(JSON.stringify(data.body))});`;
  }
}
