import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import documentsReducer from '../store/documentsSlice';
import spreadsheetReducer from '../store/spreadsheetSlice';
import uiReducer from '../store/uiSlice';
import LoginPage from './LoginPage';

function renderWithProviders(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      documents: documentsReducer,
      spreadsheet: spreadsheetReducer,
      ui: uiReducer,
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
}

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText(/email@example/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/минимум 8/i)).toBeTruthy();
  });

  it('shows validation error for short password', () => {
    renderWithProviders(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/email@example/i);
    const passInput = screen.getByPlaceholderText(/минимум 8/i);
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passInput, { target: { value: '123' } });
    fireEvent.click(screen.getByText(/войти/i));
    expect(screen.getByText(/минимум 8 символов/i)).toBeTruthy();
  });

  it('shows validation error for invalid email', () => {
    renderWithProviders(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/email@example/i);
    const passInput = screen.getByPlaceholderText(/минимум 8/i);
    fireEvent.change(emailInput, { target: { value: 'bad-email' } });
    fireEvent.change(passInput, { target: { value: '12345678' } });
    const form = emailInput.closest('form')!;
    fireEvent.submit(form);
    expect(screen.getByText(/корректный email/i)).toBeTruthy();
  });

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/регистрируйся/i)).toBeTruthy();
  });
});
