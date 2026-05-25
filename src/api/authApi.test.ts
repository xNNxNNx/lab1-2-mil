import { beforeEach, describe, expect, it } from 'vitest';
import { changeUserPassword, getProfile, login, refresh, register } from './authApi';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('register creates a user and returns tokens', async () => {
    const result = await register('Test User', 'test@example.com', 'password123');

    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('login returns tokens for correct credentials', async () => {
    await register('Test User', 'test@example.com', 'password123');
    const result = await login('test@example.com', 'password123');

    expect(result.user.name).toBe('Test User');
    expect(result.accessToken).toBeTruthy();
  });

  it('login rejects wrong password', async () => {
    await register('Test User', 'test@example.com', 'password123');

    await expect(login('test@example.com', 'wrongpass')).rejects.toThrow(
      'Неверный email или пароль',
    );
  });

  it('refresh returns a new access token', async () => {
    const result = await register('Test User', 'test@example.com', 'password123');
    const refreshed = await refresh(result.refreshToken);

    expect(refreshed.accessToken).toBeTruthy();
  });

  it('getProfile decodes user from access token', async () => {
    const result = await register('Test User', 'test@example.com', 'password123');
    const profile = await getProfile(result.accessToken);

    expect(profile.email).toBe('test@example.com');
  });

  it('changeUserPassword updates credentials', async () => {
    const result = await register('Test User', 'test@example.com', 'password123');
    await changeUserPassword(result.accessToken, 'password123', 'newpass123');
    const loginResult = await login('test@example.com', 'newpass123');

    expect(loginResult.user.email).toBe('test@example.com');
  });
});
