import { Script } from 'node:vm';
import { validate } from 'jsonschema';
import collection from '../postman/pagination-contract-lab.postman_collection.json';
import environment from '../postman/local.postman_environment.json';
import schema from './fixtures/postman-collection-v2.1.schema.json';

// Vendored from https://schema.getpostman.com/json/collection/v2.1.0/collection.json.
// These are offline asset/schema checks, not execution inside Postman.
describe('Postman assets', () => {
  test('the collection validates against the official v2.1 JSON schema', () => {
    const result = validate(collection, schema);
    expect(result.errors.map((error) => error.stack)).toEqual([]);
  });

  test('contains six clearly named primary scenarios and eight supplementary requests', () => {
    expect(collection.item).toHaveLength(6);
    const requests = collection.item.flatMap((folder) => folder.item);
    expect(requests).toHaveLength(14);
    expect(requests.filter((item) => item.name.includes('Primary'))).toHaveLength(6);
    expect(requests.filter((item) => item.name.includes('Supplementary'))).toHaveLength(8);
    collection.item.forEach((folder, index) => {
      expect(folder.name).toMatch(new RegExp(`^Test ${index + 1} `));
      expect(folder.item[0]?.name).toMatch(new RegExp(`^T${index + 1} Primary `));
    });
  });

  test('the environment and collection default to a credential-free local base URL', () => {
    expect(collection.variable).toContainEqual(expect.objectContaining({
      key: 'baseUrl', value: 'http://localhost:3000',
    }));
    expect(environment._postman_variable_scope).toBe('environment');
    expect(environment.name).toContain('Local development');
    expect(environment.values).toEqual([
      { key: 'baseUrl', value: 'http://localhost:3000', type: 'default', enabled: true },
    ]);
  });

  test('all request URLs agree with their structured query definitions', () => {
    for (const folder of collection.item) {
      for (const item of folder.item) {
        expect(item.request.method).toBe('GET');
        expect(item.request.description.length).toBeGreaterThan(0);
        expect(item.request.url.host).toEqual(['{{baseUrl}}']);
        expect(item.request.url.path).toEqual(['api', 'products']);
        const url = new URL(item.request.url.raw.replace('{{baseUrl}}', 'http://localhost:3000'));
        const query = 'query' in item.request.url ? item.request.url.query : [];
        const expectedQuery = query.map(({ key, value }) => [key, value]);
        expect([...url.searchParams.entries()]).toEqual(expectedQuery);
        expect(url.username).toBe('');
        expect(url.password).toBe('');
        expect(item).not.toHaveProperty('response');
      }
    }
  });

  test('all collection and request test scripts have valid JavaScript syntax', () => {
    const events = [
      ...collection.event,
      ...collection.item.flatMap((folder) => folder.item.flatMap((item) => item.event)),
    ];
    expect(events).toHaveLength(15);
    for (const event of events) {
      expect(event.listen).toBe('test');
      expect(event.script.type).toBe('text/javascript');
      const source = event.script.exec.join('\n');
      expect(source).toContain('pm.test(');
      expect(() => new Script(source)).not.toThrow();
      expect(source).not.toMatch(/pm\.sendRequest|pm\.environment\.set|setNextRequest/);
    }
  });
});
