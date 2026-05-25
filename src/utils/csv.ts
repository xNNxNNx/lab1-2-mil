import type { SheetData, SpreadsheetDocument } from '../types';
import { getCellKey, colIndexToLetter, getDefaultCell } from './cellHelpers';

export function exportToCSV(cells: SheetData, rows: number, cols: number): string {
  const lines: string[] = [];
  const header = Array.from({ length: cols }, (_, c) => colIndexToLetter(c));
  lines.push(header.join(','));

  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      const key = getCellKey(r, c);
      const cell = cells[key];
      let val = cell?.computed || cell?.value || '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      row.push(val);
    }
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

export function exportToJSON(doc: SpreadsheetDocument): string {
  return JSON.stringify(doc, null, 2);
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function importCSV(csvString: string): { cells: SheetData; rows: number; cols: number } {
  const lines = csvString.trim().split(/\r?\n/);
  if (lines.length === 0) return { cells: {}, rows: 0, cols: 0 };

  const cells: SheetData = {};
  let maxCols = 0;

  for (let r = 0; r < lines.length; r++) {
    const values = parseCSVLine(lines[r]);
    maxCols = Math.max(maxCols, values.length);
    for (let c = 0; c < values.length; c++) {
      const val = values[c].trim();
      if (val) {
        const key = getCellKey(r, c);
        cells[key] = { ...getDefaultCell(), value: val, computed: val };
      }
    }
  }

  return { cells, rows: lines.length, cols: maxCols };
}
