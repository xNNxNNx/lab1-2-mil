import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { WEATHER_REFRESH_MS } from './constants';

const { fetchCitySuggestions, loadWeatherBundle } = vi.hoisted(() => ({
  fetchCitySuggestions: vi.fn(),
  loadWeatherBundle: vi.fn(),
}));

vi.mock('./api/weatherApi', () => ({
  fetchCitySuggestions,
  loadWeatherBundle,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('loads default city weather on start', async () => {
    fetchCitySuggestions.mockResolvedValue([
      {
        name: 'Moscow',
        country: 'RU',
        lat: 55.75,
        lon: 37.61,
        label: 'Moscow, RU',
      },
    ]);
    loadWeatherBundle.mockResolvedValue({
      locationLabel: 'Moscow, RU',
      current: {
        temperature: 14,
        feelsLike: 12,
        description: 'ясно',
        humidity: 55,
        windSpeed: 4,
        icon: '01d',
        theme: 'clear',
      },
      forecast: [
        {
          date: '2026-04-06',
          weekday: 'пн',
          temperature: 14,
          description: 'ясно',
          icon: '01d',
        },
      ],
      air: {
        aqi: 2,
        label: 'Умеренный',
        components: {
          co: 1,
          no: 2,
          no2: 3,
          o3: 4,
          so2: 5,
          pm2_5: 6,
          pm10: 7,
          nh3: 8,
        },
      },
      updatedAt: '12:00',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Moscow, RU' })).toBeInTheDocument();
    });

    expect(fetchCitySuggestions).toHaveBeenCalledWith('Moscow');
    expect(loadWeatherBundle).toHaveBeenCalledTimes(1);
  });

  it('updates weather every three hours', async () => {
    vi.useFakeTimers();

    fetchCitySuggestions.mockResolvedValue([
      {
        name: 'Moscow',
        country: 'RU',
        lat: 55.75,
        lon: 37.61,
        label: 'Moscow, RU',
      },
    ]);
    loadWeatherBundle.mockResolvedValue({
      locationLabel: 'Moscow, RU',
      current: {
        temperature: 14,
        feelsLike: 12,
        description: 'ясно',
        humidity: 55,
        windSpeed: 4,
        icon: '01d',
        theme: 'clear',
      },
      forecast: [],
      air: {
        aqi: 2,
        label: 'Умеренный',
        components: {
          co: 1,
          no: 2,
          no2: 3,
          o3: 4,
          so2: 5,
          pm2_5: 6,
          pm10: 7,
          nh3: 8,
        },
      },
      updatedAt: '12:00',
    });

    render(<App />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(loadWeatherBundle).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(WEATHER_REFRESH_MS);
      await Promise.resolve();
    });

    expect(loadWeatherBundle).toHaveBeenCalledTimes(2);
  });

  it('searches and loads another city after selection', async () => {
    const user = userEvent.setup();

    fetchCitySuggestions
      .mockResolvedValueOnce([
        {
          name: 'Moscow',
          country: 'RU',
          lat: 55.75,
          lon: 37.61,
          label: 'Moscow, RU',
        },
      ])
      .mockResolvedValueOnce([
        {
          name: 'Bangkok',
          country: 'TH',
          lat: 13.75,
          lon: 100.5,
          label: 'Bangkok, TH',
        },
      ]);

    loadWeatherBundle
      .mockResolvedValueOnce({
        locationLabel: 'Moscow, RU',
        current: {
          temperature: 14,
          feelsLike: 12,
          description: 'ясно',
          humidity: 55,
          windSpeed: 4,
          icon: '01d',
          theme: 'clear',
        },
        forecast: [],
        air: {
          aqi: 2,
          label: 'Умеренный',
          components: {
            co: 1,
            no: 2,
            no2: 3,
            o3: 4,
            so2: 5,
            pm2_5: 6,
            pm10: 7,
            nh3: 8,
          },
        },
        updatedAt: '12:00',
      })
      .mockResolvedValueOnce({
        locationLabel: 'Bangkok, TH',
        current: {
          temperature: 31,
          feelsLike: 35,
          description: 'облачно',
          humidity: 70,
          windSpeed: 3,
          icon: '02d',
          theme: 'clouds',
        },
        forecast: [],
        air: {
          aqi: 3,
          label: 'Немного загрязнён',
          components: {
            co: 1,
            no: 2,
            no2: 3,
            o3: 4,
            so2: 5,
            pm2_5: 6,
            pm10: 7,
            nh3: 8,
          },
        },
        updatedAt: '15:00',
      });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Moscow, RU' })).toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText('Введите город'));
    await user.type(screen.getByPlaceholderText('Введите город'), 'Bangkok');
    await user.click(screen.getByRole('button', { name: 'Найти' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Bangkok, TH' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Bangkok, TH' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Bangkok, TH' })).toBeInTheDocument();
    });
  });
});
