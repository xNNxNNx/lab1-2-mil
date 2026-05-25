import { describe, it, expect } from 'vitest';
import { exportToCSV, importCSV, exportToJSON } from './csv';
import { getDefaultCell } from './cellHelpers';
import type { SheetData, SpreadsheetDocument } from '../types';

describe('csv utilities', () => {
  it('exportToCSV should produce proper CSV string', () => {
    const cells: SheetData = {
      'A1': { ...getDefaultCell(), value: 'Hello', computed: 'Hello' },
      'B1': { ...getDefaultCell(), value: '42', computed: '42' },
    };
    const csv = exportToCSV(cells, 2, 2);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('A,B');
    expect(lines[1]).toBe('Hello,42');
    expect(lines[2]).toBe(',');
  });

  it('importCSV should parse CSV and create cells', () => {
    const csv = 'Name,Age\nAlice,30\nBob,25';
    const result = importCSV(csv);
    expect(result.rows).toBe(3);
    expect(result.cols).toBe(2);
    expect(result.cells['A1'].value).toBe('Name');
    expect(result.cells['B1'].value).toBe('Age');
    expect(result.cells['A2'].value).toBe('Alice');
    expect(result.cells['B2'].value).toBe('30');
    expect(result.cells['A3'].value).toBe('Bob');
    expect(result.cells['B3'].value).toBe('25');
  });

  it('exportToJSON should return valid JSON', () => {
    const doc: SpreadsheetDocument = {
      id: 'doc-1',
      title: 'Test Sheet',
      rows: 10,
      cols: 5,
      cells: {
        'A1': { ...getDefaultCell(), value: '1', computed: '1' },
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 'user-1',
    };
    const json = exportToJSON(doc);
    const parsed = JSON.parse(json);
    expect(parsed.id).toBe('doc-1');
    expect(parsed.title).toBe('Test Sheet');
    expect(parsed.cells['A1'].value).toBe('1');
  });
});
