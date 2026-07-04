import type { SampleRequestData } from './utils';
import { prettyJson } from './values';

type BodyLang = 'js' | 'csharp' | 'go' | 'java';

export function generateBody(data: SampleRequestData, lang: BodyLang): string | undefined {
  if (!data.body || !data.bodyMediaType) {
    return undefined;
  }

  if (data.bodyMediaType !== 'application/json') {
    return undefined;
  }

  const json = prettyJson(data.body);

  switch (lang) {
    case 'js':
      return `const body = JSON.stringify(${json});`;
    case 'csharp':
      return ['var json = """', json, '""";', 'var body = new StringContent(json, Encoding.UTF8, "application/json");'].join(
        '\n',
      );
    case 'go':
      return `body := strings.NewReader(\`${json}\`)`;
    case 'java':
      return ['String json = """', json, '""";', 'var body = HttpRequest.BodyPublishers.ofString(json);'].join('\n');
  }
}
