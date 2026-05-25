import type { User } from '../types';

const USERS_KEY = 'spreadsheet_users';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  registeredAt: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function makeToken(userId: string, expiresIn: number): string {
  return btoa(JSON.stringify({ userId, exp: Date.now() + expiresIn }));
}

function decodeToken(token: string): { userId: string; exp: number } {
  return JSON.parse(atob(token));
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const users = loadUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('Пользователь с таким email уже существует 😓');
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    registeredAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);

  return delay({
    user: { id: user.id, name: user.name, email: user.email, registeredAt: user.registeredAt },
    accessToken: makeToken(user.id, 15 * 60 * 1000),
    refreshToken: makeToken(user.id, 7 * 24 * 60 * 60 * 1000),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Неверный email или пароль 😓');

  return delay({
    user: { id: user.id, name: user.name, email: user.email, registeredAt: user.registeredAt },
    accessToken: makeToken(user.id, 15 * 60 * 1000),
    refreshToken: makeToken(user.id, 7 * 24 * 60 * 60 * 1000),
  });
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  const decoded = decodeToken(refreshToken);
  if (Date.now() > decoded.exp) throw new Error('Refresh токен истёк');
  return delay({ accessToken: makeToken(decoded.userId, 15 * 60 * 1000) });
}

export async function getProfile(accessToken: string): Promise<User> {
  const decoded = decodeToken(accessToken);
  const users = loadUsers();
  const user = users.find((u) => u.id === decoded.userId);
  if (!user) throw new Error('Пользователь не найден');
  return delay({
    id: user.id,
    name: user.name,
    email: user.email,
    registeredAt: user.registeredAt,
  });
}

export async function updateUserProfile(accessToken: string, name: string): Promise<User> {
  const decoded = decodeToken(accessToken);
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === decoded.userId);
  if (idx < 0) throw new Error('Пользователь не найден');
  users[idx].name = name;
  saveUsers(users);
  return delay({
    id: users[idx].id,
    name: users[idx].name,
    email: users[idx].email,
    registeredAt: users[idx].registeredAt,
  });
}

export async function changeUserPassword(
  accessToken: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const decoded = decodeToken(accessToken);
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === decoded.userId);
  if (idx < 0) throw new Error('Пользователь не найден');
  if (users[idx].password !== oldPassword) throw new Error('Неверный старый пароль 😓');
  users[idx].password = newPassword;
  saveUsers(users);
  return delay(undefined);
}
