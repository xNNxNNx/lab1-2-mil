import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const { login } = await import('../api/authApi');
    return login(email, password);
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const { register } = await import('../api/authApi');
    return register(name, email, password);
  },
);

export const refreshToken = createAsyncThunk('auth/refresh', async () => {
  const { refresh } = await import('../api/authApi');
  const token = localStorage.getItem('refreshToken');
  if (!token) throw new Error('Нет refresh токена');
  return refresh(token);
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name }: { name: string }, { getState }) => {
    const { updateUserProfile } = await import('../api/authApi');
    const state = getState() as { auth: AuthState };
    return updateUserProfile(state.auth.accessToken ?? '', name);
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
    { getState },
  ) => {
    const { changeUserPassword } = await import('../api/authApi');
    const state = getState() as { auth: AuthState };
    return changeUserPassword(state.auth.accessToken ?? '', oldPassword, newPassword);
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('refreshToken');
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка входа';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка регистрации';
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.error.message ?? 'Ошибка смены пароля';
      });
  },
});

export const { logoutUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
