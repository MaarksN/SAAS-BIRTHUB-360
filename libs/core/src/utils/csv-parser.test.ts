import { describe, expect, it } from 'vitest';
import { parseCSV } from './csv-parser';

describe('parseCSV', () => {
  it('should parse a simple CSV with headers', () => {
    const csv = `name,email,role
John Doe,john@example.com,admin
Jane Smith,jane@example.com,user`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'John Doe', email: 'john@example.com', role: 'admin' });
    expect(result[1]).toEqual({ name: 'Jane Smith', email: 'jane@example.com', role: 'user' });
  });

  it('should handle quoted fields containing commas', () => {
    const csv = `name,description
"Doe, John","Developer, Senior"
"Smith, Jane","Manager"`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'Doe, John', description: 'Developer, Senior' });
    expect(result[1]).toEqual({ name: 'Smith, Jane', description: 'Manager' });
  });

  it('should handle quoted fields containing newlines', () => {
    const csv = `id,note
1,"First line
Second line"`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: '1', note: 'First line\nSecond line' });
  });

  it('should handle empty fields', () => {
    const csv = `a,b,c
1,,3
,2,`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ a: '1', b: '', c: '3' });
    expect(result[1]).toEqual({ a: '', b: '2', c: '' });
  });

  it('should return empty array for empty string', () => {
    expect(parseCSV('')).toEqual([]);
  });

  it('should return empty array for only headers', () => {
    const csv = `name,email`;
    // The implementation returns [] if lines.length < 2
    expect(parseCSV(csv)).toEqual([]);
  });

  it('should handle Windows newlines (CRLF)', () => {
    const csv = "col1,col2\r\nval1,val2\r\nval3,val4";
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ col1: 'val1', col2: 'val2' });
    expect(result[1]).toEqual({ col1: 'val3', col2: 'val4' });
  });
});
