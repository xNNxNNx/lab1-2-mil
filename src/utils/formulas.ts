import type { SheetData } from '../types';
import { expandRange, parseCellKey, getCellKey } from './cellHelpers';

function getCellNumericValue(key: string, cells: SheetData): number {
  const cell = cells[key];
  if (!cell) return 0;
  const val = cell.computed || cell.value;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

function handleSumOrAverage(
  fnName: string,
  argsStr: string,
  cells: SheetData,
): string {
  const keys = expandRange(argsStr.trim());
  const values = keys.map((k) => getCellNumericValue(k, cells));
  const sum = values.reduce((a, b) => a + b, 0);

  if (fnName === 'SUM') return String(sum);
  if (fnName === 'AVERAGE') {
    if (values.length === 0) return '#ERROR';
    return String(sum / values.length);
  }
  return '#ERROR';
}

export function evaluateFormula(formula: string, cells: SheetData): string {
  try {
    const expr = formula.slice(1).trim();

    const fnMatch = expr.match(/^(SUM|AVERAGE)\((.+)\)$/i);
    if (fnMatch) {
      return handleSumOrAverage(fnMatch[1].toUpperCase(), fnMatch[2], cells);
    }

    const replaced = expr.replace(/[A-Z]\d+/g, (ref) => {
      const parsed = parseCellKey(ref);
      const key = getCellKey(parsed.row, parsed.col);
      return String(getCellNumericValue(key, cells));
    });

    const result = new Function(`return (${replaced})`)();
    if (typeof result === 'number' && !isFinite(result)) return '#ERROR';
    return String(result);
  } catch {
    return '#ERROR';
  }
}
