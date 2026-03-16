import { readFile, writeFile } from 'node:fs/promises';

type CSVValue = number | string;

function parseValue(value: string): CSVValue {
  const normalizedValue = value.trim();

  if (/^-?\d+(\.\d+)?$/.test(normalizedValue)) {
    return Number(normalizedValue);
  }

  return normalizedValue;
}

function removeTrailingEmptyLines(lines: string[]): string[] {
  const normalizedLines = [...lines];

  while (normalizedLines.length > 0 && normalizedLines[normalizedLines.length - 1] === '') {
    normalizedLines.pop();
  }

  return normalizedLines;
}

export function csvToJSON(input: string[], delimiter: string): object[] {
  if (delimiter.length === 0) {
    throw new Error('Delimiter must not be empty');
  }

  if (input.length < 2) {
    throw new Error('CSV must contain a header and at least one data row');
  }

  const [headerLine, ...dataLines] = input;

  if (headerLine === undefined) {
    throw new Error('Failed to read CSV header');
  }

  const headers = headerLine.split(delimiter).map((header) => header.trim());

  if (headers.some((header) => header.length === 0)) {
    throw new Error('Column names must not be empty');
  }

  const result: Array<Record<string, CSVValue>> = [];
  let expectedTypes: Array<'number' | 'string'> | null = null;

  for (const line of dataLines) {
    const values = line.split(delimiter).map(parseValue);

    if (values.length !== headers.length) {
      throw new Error('Value count does not match header count');
    }

    const currentTypes = values.map((value) => typeof value as 'number' | 'string');

    if (expectedTypes === null) {
      expectedTypes = currentTypes;
    } else {
      currentTypes.forEach((type, index) => {
        if (type !== expectedTypes?.[index]) {
          throw new Error('Column value types must stay consistent');
        }
      });
    }

    const row: Record<string, CSVValue> = {};

    headers.forEach((header, index) => {
      const value = values[index];

      if (value === undefined) {
        throw new Error('Failed to read column value');
      }

      row[header] = value;
    });

    result.push(row);
  }

  return result;
}

export async function formatCSVFileToJSONFile(
  input: string,
  output: string,
  delimiter: string,
): Promise<void> {
  const fileContent = await readFile(input, 'utf-8');
  const lines = removeTrailingEmptyLines(fileContent.split(/\r?\n/));
  const json = csvToJSON(lines, delimiter);

  await writeFile(output, JSON.stringify(json, null, 2), 'utf-8');
}
