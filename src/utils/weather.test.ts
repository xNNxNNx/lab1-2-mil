import { describe, expect, it } from 'vitest';

import {
  buildAirSummary,
  buildForecastDays,
  formatLocationLabel,
  getAirQualityLabel,
  getWeatherTheme,
} from './weather';

describe('weather utils', () => {
  it('formats city label', () => {
    expect(
      formatLocationLabel({
        name: 'Moscow',
        country: 'RU',
        state: 'Moscow',
        lat: 1,
        lon: 2,
      }),
    ).toBe('Moscow, Moscow, RU');
  });

  it('maps weather ids to a theme', () => {
    expect(getWeatherTheme(800)).toBe('clear');
    expect(getWeatherTheme(803)).toBe('clouds');
    expect(getWeatherTheme(501)).toBe('rain');
    expect(getWeatherTheme(601)).toBe('snow');
    expect(getWeatherTheme(211)).toBe('storm');
    expect(getWeatherTheme(741)).toBe('mist');
  });

  it('builds forecast for unique days', () => {
    const result = buildForecastDays([
      {
        dt: 1,
        dt_txt: '2026-04-06 09:00:00',
        main: { temp: 18, feels_like: 18, humidity: 60 },
        weather: [{ id: 800, main: 'Clear', description: 'ясно', icon: '01d' }],
        wind: { speed: 4 },
      },
      {
        dt: 2,
        dt_txt: '2026-04-06 12:00:00',
        main: { temp: 21, feels_like: 21, humidity: 55 },
        weather: [{ id: 801, main: 'Clouds', description: 'облачно', icon: '02d' }],
        wind: { speed: 5 },
      },
      {
        dt: 3,
        dt_txt: '2026-04-07 12:00:00',
        main: { temp: 17, feels_like: 17, humidity: 70 },
        weather: [{ id: 500, main: 'Rain', description: 'дождь', icon: '10d' }],
        wind: { speed: 7 },
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      date: '2026-04-06',
      temperature: 21,
      description: 'облачно',
      icon: '02d',
    });
  });

  it('builds air quality summary', () => {
    expect(getAirQualityLabel(3)).toBe('Немного загрязнён');
    expect(
      buildAirSummary({
        main: { aqi: 2 },
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
      }),
    ).toMatchObject({
      aqi: 2,
      label: 'Умеренный',
    });
  });
});
