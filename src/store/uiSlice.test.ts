import { describe, it, expect } from 'vitest';
import reducer, {
  setSaveStatus,
  openCreateModal,
  closeCreateModal,
  showNotification,
  clearNotification,
  setDeleteConfirm,
} from './uiSlice';

describe('uiSlice', () => {
  const getInitialState = () => reducer(undefined, { type: '@@INIT' });

  it('should return correct initial state', () => {
    const state = getInitialState();
    expect(state.saveStatus).toBe('idle');
    expect(state.showCreateModal).toBe(false);
    expect(state.showDeleteConfirm).toBeNull();
    expect(state.notification).toBeNull();
  });

  it('setSaveStatus should change saveStatus', () => {
    const state = reducer(getInitialState(), setSaveStatus('saving'));
    expect(state.saveStatus).toBe('saving');
  });

  it('openCreateModal should set showCreateModal to true', () => {
    const state = reducer(getInitialState(), openCreateModal());
    expect(state.showCreateModal).toBe(true);
  });

  it('closeCreateModal should set showCreateModal to false', () => {
    let state = reducer(getInitialState(), openCreateModal());
    state = reducer(state, closeCreateModal());
    expect(state.showCreateModal).toBe(false);
  });

  it('showNotification should set notification', () => {
    const notification = { message: 'Saved!', type: 'success' as const };
    const state = reducer(getInitialState(), showNotification(notification));
    expect(state.notification).toEqual(notification);
  });

  it('clearNotification should clear notification', () => {
    const notification = { message: 'Error!', type: 'error' as const };
    let state = reducer(getInitialState(), showNotification(notification));
    state = reducer(state, clearNotification());
    expect(state.notification).toBeNull();
  });

  it('setDeleteConfirm should set showDeleteConfirm', () => {
    const state = reducer(getInitialState(), setDeleteConfirm('doc-456'));
    expect(state.showDeleteConfirm).toBe('doc-456');
  });
});
