import type { CellData } from '../types';

export function colIndexToLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function letterToColIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

export function getCellKey(row: number, col: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

export function parseCellKey(key: string): { row: number; col: number } {
  const match = key.match(/^([A-Z])(\d+)$/);
  if (!match) return { row: 0, col: 0 };
  return {
    col: letterToColIndex(match[1]),
    row: parseInt(match[2], 10) - 1,
  };
}

export function getDefaultCell(): CellData {
  return {
    value: '',
    computed: '',
    bold: false,
    italic: false,
    underline: false,
    bgColor: '',
    textColor: '',
    align: 'left',
    format: 'text',
  };
}

export function expandRange(range: string): string[] {
  const parts = range.split(':');
  if (parts.length !== 2) return [range];

  const start = parseCellKey(parts[0]);
  const end = parseCellKey(parts[1]);
  const keys: string[] = [];

  for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
    for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
      keys.push(getCellKey(r, c));
    }
  }
  return keys;
}
