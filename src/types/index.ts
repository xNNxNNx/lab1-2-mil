export interface CellData {
  value: string;
  computed: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bgColor: string;
  textColor: string;
  align: 'left' | 'center' | 'right';
  format: 'text' | 'number' | 'percent' | 'currency' | 'date';
}

export type CellKey = string;

export type SheetData = Record<CellKey, CellData>;

export interface SpreadsheetDocument {
  id: string;
  title: string;
  rows: number;
  cols: number;
  cells: SheetData;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
}

export interface Selection {
  active: CellKey | null;
  range: CellKey[] | null;
}

export type ColumnWidths = Record<number, number>;
export type RowHeights = Record<number, number>;
