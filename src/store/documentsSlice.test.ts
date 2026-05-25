import { describe, it, expect } from 'vitest';
import reducer, { setActiveDocument } from './documentsSlice';

describe('documentsSlice', () => {
  const getInitialState = () => reducer(undefined, { type: '@@INIT' });

  it('should return correct initial state', () => {
    const state = getInitialState();
    expect(state.list).toEqual([]);
    expect(state.activeDocumentId).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setActiveDocument should change activeDocumentId', () => {
    const state = reducer(getInitialState(), setActiveDocument('doc-123'));
    expect(state.activeDocumentId).toBe('doc-123');
  });
});
