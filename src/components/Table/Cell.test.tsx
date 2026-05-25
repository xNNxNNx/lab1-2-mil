import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Cell from './Cell';
import type { CellData } from '../../types';

function makeCell(overrides: Partial<CellData> = {}): CellData {
  return {
    value: 'test',
    computed: 'test',
    bold: false,
    italic: false,
    underline: false,
    bgColor: '',
    textColor: '',
    align: 'left',
    format: 'text',
    ...overrides,
  };
}

describe('Cell', () => {
  it('renders cell value', () => {
    render(
      <table>
        <tbody>
          <tr>
            <Cell
              cellKey="0:0"
              data={makeCell({ value: 'hello', computed: 'hello' })}
              isActive={false}
              isInRange={false}
              width={100}
              height={28}
              onSelect={vi.fn()}
              onEdit={vi.fn()}
            />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('enters edit mode on double-click', () => {
    render(
      <table>
        <tbody>
          <tr>
            <Cell
              cellKey="0:0"
              data={makeCell({ value: 'hello', computed: 'hello' })}
              isActive={true}
              isInRange={false}
              width={100}
              height={28}
              onSelect={vi.fn()}
              onEdit={vi.fn()}
            />
          </tr>
        </tbody>
      </table>,
    );

    fireEvent.doubleClick(screen.getByText('hello'));
    const input = screen.getByDisplayValue('hello');
    expect(input).toBeTruthy();
  });

  it('calls onEdit when editing is committed', () => {
    const onEdit = vi.fn();
    render(
      <table>
        <tbody>
          <tr>
            <Cell
              cellKey="0:0"
              data={makeCell({ value: '', computed: '' })}
              isActive={true}
              isInRange={false}
              width={100}
              height={28}
              onSelect={vi.fn()}
              onEdit={onEdit}
            />
          </tr>
        </tbody>
      </table>,
    );

    const td = screen.getByRole('cell');
    fireEvent.doubleClick(td);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEdit).toHaveBeenCalledWith('0:0', 'new value');
  });

  it('applies bold style', () => {
    render(
      <table>
        <tbody>
          <tr>
            <Cell
              cellKey="0:0"
              data={makeCell({ value: 'bold', computed: 'bold', bold: true })}
              isActive={false}
              isInRange={false}
              width={100}
              height={28}
              onSelect={vi.fn()}
              onEdit={vi.fn()}
            />
          </tr>
        </tbody>
      </table>,
    );
    const td = screen.getByRole('cell');
    expect(td.style.fontWeight).toBe('bold');
  });

  it('calls onSelect on click', () => {
    const onSelect = vi.fn();
    render(
      <table>
        <tbody>
          <tr>
            <Cell
              cellKey="0:0"
              data={makeCell()}
              isActive={false}
              isInRange={false}
              width={100}
              height={28}
              onSelect={onSelect}
              onEdit={vi.fn()}
            />
          </tr>
        </tbody>
      </table>,
    );
    fireEvent.click(screen.getByRole('cell'));
    expect(onSelect).toHaveBeenCalledWith('0:0', false);
  });
});
