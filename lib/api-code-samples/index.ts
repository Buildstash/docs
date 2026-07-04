import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';
import { apiCodeGenerators } from './generators';

export function createApiCodeUsageRegistry() {
  const registry = createCodeUsageGeneratorRegistry();

  registry.add('curl', apiCodeGenerators.curl);
  registry.add('js', apiCodeGenerators.javascript);
  registry.add('python', apiCodeGenerators.python);
  registry.add('php', apiCodeGenerators.php);
  registry.add('csharp', apiCodeGenerators.csharp);
  registry.add('go', apiCodeGenerators.go);
  registry.add('java', apiCodeGenerators.java);

  return registry;
}
