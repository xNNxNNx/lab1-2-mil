import { describe, it, expect } from 'vitest';
import { evaluateFormula } from './formulas';
import { getDefaultCell } from './cellHelpers';
import type { SheetData } from '../types';

describe('evaluateFormula', () => {
  it('SUM(A1:A3) should return "60"', () => {
    const cells: SheetData = {
      A1: { ...getDefaultCell(), value: '10', computed: '10' },
      A2: { ...getDefaultCell(), value: '20', computed: '20' },
      A3: { ...getDefaultCell(), value: '30', computed: '30' },
    };
    expect(evaluateFormula('=SUM(A1:A3)', cells)).toBe('60');
  });

  it('AVERAGE(A1:A3) should return "20"', () => {
    const cells: SheetData = {
      A1: { ...getDefaultCell(), value: '10', computed: '10' },
      A2: { ...getDefaultCell(), value: '20', computed: '20' },
      A3: { ...getDefaultCell(), value: '30', computed: '30' },
    };
    expect(evaluateFormula('=AVERAGE(A1:A3)', cells)).toBe('20');
  });

  it('arithmetic A1+B1 should return "8"', () => {
    const cells: SheetData = {
      A1: { ...getDefaultCell(), value: '5', computed: '5' },
      B1: { ...getDefaultCell(), value: '3', computed: '3' },
    };
    expect(evaluateFormula('=A1+B1', cells)).toBe('8');
  });

  it('invalid formula should return "#ERROR"', () => {
    const cells: SheetData = {};
    expect(evaluateFormula('=INVALID()', cells)).toBe('#ERROR');
  });
});
