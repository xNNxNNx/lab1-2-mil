import { describe, it, expect } from 'vitest';
import reducer, { logoutUser, clearAuthError } from './authSlice';

describe('authSlice', () => {
  const getInitialState = () => reducer(undefined, { type: '@@INIT' });

  it('should return correct initial state', () => {
    const state = getInitialState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('logoutUser should clear user and token', () => {
    const loggedInState = {
      user: { id: '1', name: 'Test', email: 'test@test.com', registeredAt: '2024-01-01' },
      accessToken: 'token-abc',
      isAuthenticated: true,
      loading: false,
      error: null,
    };
    const state = reducer(loggedInState, logoutUser());
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('clearAuthError should clear error', () => {
    const stateWithError = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      error: 'Something went wrong',
    };
    const state = reducer(stateWithError, clearAuthError());
    expect(state.error).toBeNull();
  });
});
