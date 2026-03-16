import { readFile, writeFile } from 'node:fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { csvToJSON, formatCSVFileToJSONFile } from '../src/lab3';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

describe('csvToJSON', () => {
  it('converts csv lines into an array of objects', () => {
    const result = csvToJSON(
      ['id;name;group', '1;Ivan;A-01', '2;Maria;B-02'],
      ';',
    );

    expect(result).toEqual([
      {
        id: 1,
        name: 'Ivan',
        group: 'A-01',
      },
      {
        id: 2,
        name: 'Maria',
        group: 'B-02',
      },
    ]);
  });

  it('throws when the value count does not match the header', () => {
    expect(() => csvToJSON(['id;name;group', '1;Ivan'], ';')).toThrowError(
      'Value count does not match header count',
    );
  });

  it('throws when a column type changes in another row', () => {
    expect(() =>
      csvToJSON(['id;name', '1;Ivan', 'text;Maria'], ';'),
    ).toThrowError('Column value types must stay consistent');
  });

  it('throws when there are no data rows', () => {
    expect(() => csvToJSON(['id;name'], ';')).toThrowError(
      'CSV must contain a header and at least one data row',
    );
  });
});

describe('formatCSVFileToJSONFile', () => {
  const readFileMock = vi.mocked(readFile);
  const writeFileMock = vi.mocked(writeFile);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads csv, converts it and writes json to a new file', async () => {
    readFileMock.mockResolvedValue('id;name\r\n1;Ivan\r\n2;Maria\r\n');
    writeFileMock.mockResolvedValue();

    await formatCSVFileToJSONFile('input.csv', 'output.json', ';');

    expect(readFileMock).toHaveBeenCalledWith('input.csv', 'utf-8');
    expect(writeFileMock).toHaveBeenCalledWith(
      'output.json',
      JSON.stringify(
        [
          { id: 1, name: 'Ivan' },
          { id: 2, name: 'Maria' },
        ],
        null,
        2,
      ),
      'utf-8',
    );
  });

  it('does not write a file when csv is invalid', async () => {
    readFileMock.mockResolvedValue('id;name\r\n1;Ivan\r\ntext;Maria\r\n');
    writeFileMock.mockResolvedValue();

    await expect(
      formatCSVFileToJSONFile('input.csv', 'output.json', ';'),
    ).rejects.toThrowError('Column value types must stay consistent');

    expect(writeFileMock).not.toHaveBeenCalled();
  });
});
