const { generateCode, isValidUrl } = require('./lib');

test('generateCode returns the requested length of safe characters', () => {
  const code = generateCode(6);
  expect(code).toHaveLength(6);
  expect(code).toMatch(/^[A-Za-z0-9]+$/);
});

test('isValidUrl accepts http and https only', () => {
  expect(isValidUrl('https://example.com/path?x=1')).toBe(true);
  expect(isValidUrl('http://localhost:3000')).toBe(true);
  expect(isValidUrl('ftp://example.com')).toBe(false);
  expect(isValidUrl('javascript:alert(1)')).toBe(false);
  expect(isValidUrl('nope')).toBe(false);
  expect(isValidUrl(null)).toBe(false);
});
