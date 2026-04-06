import {
  buildAirSummary,
  buildForecastDays,
  formatLocationLabel,
  getWeatherTheme,
} from '../utils/weather';
import type {
  AirPollutionResponse,
  CityOption,
  ForecastResponse,
  GeocodingResponseItem,
  WeatherBundle,
} from '../types';

const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_POLLUTION_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

function getApiKey() {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Добавьте VITE_OPENWEATHER_API_KEY в .env.local');
  }

  return apiKey;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Не удалось загрузить данные');
  }

  return response.json() as Promise<T>;
}

export async function fetchCitySuggestions(query: string): Promise<CityOption[]> {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams({
    q: query,
    limit: '5',
    appid: apiKey,
  });
  const data = await fetchJson<GeocodingResponseItem[]>(`${GEOCODING_API_URL}?${searchParams}`);

  return data.map((item) => ({
    ...item,
    label: formatLocationLabel(item),
  }));
}

export async function loadWeatherBundle(city: CityOption): Promise<WeatherBundle> {
  const apiKey = getApiKey();
  const commonParams = new URLSearchParams({
    lat: String(city.lat),
    lon: String(city.lon),
    appid: apiKey,
    units: 'metric',
    lang: 'ru',
  });

  const [forecastData, airData] = await Promise.all([
    fetchJson<ForecastResponse>(`${FORECAST_API_URL}?${commonParams}`),
    fetchJson<AirPollutionResponse>(`${AIR_POLLUTION_API_URL}?${commonParams}`),
  ]);

  const current = forecastData.list[0];
  const currentWeather = current?.weather[0];
  const air = buildAirSummary(airData.list[0]);

  return {
    locationLabel: city.label,
    current: {
      temperature: Math.round(current?.main.temp ?? 0),
      feelsLike: Math.round(current?.main.feels_like ?? 0),
      description: currentWeather?.description ?? '',
      humidity: current?.main.humidity ?? 0,
      windSpeed: current?.wind.speed ?? 0,
      icon: currentWeather?.icon ?? '',
      theme: getWeatherTheme(currentWeather?.id ?? 800),
    },
    forecast: buildForecastDays(forecastData.list),
    air,
    updatedAt: new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
