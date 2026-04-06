import { useEffect, useState } from 'react';

import { fetchCitySuggestions, loadWeatherBundle } from './api/weatherApi';
import { DEFAULT_CITY, WEATHER_REFRESH_MS } from './constants';
import { AirQualityCard } from './components/AirQualityCard';
import { CitySearch } from './components/CitySearch';
import { ForecastList } from './components/ForecastList';
import { WeatherSummary } from './components/WeatherSummary';
import type { CityOption, WeatherBundle } from './types';
import './App.css';

export default function App() {
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchCities(searchQuery: string) {
    setSearchLoading(true);
    setError('');

    try {
      const items = await fetchCitySuggestions(searchQuery);
      setSuggestions(items);
      return items;
    } catch {
      setError('Не удалось найти город');
      return [];
    } finally {
      setSearchLoading(false);
    }
  }

  async function updateWeather(city: CityOption) {
    setWeatherLoading(true);
    setError('');

    try {
      const bundle = await loadWeatherBundle(city);
      setWeather(bundle);
    } catch (errorValue) {
      const message =
        errorValue instanceof Error ? errorValue.message : 'Не удалось загрузить прогноз';
      setError(message);
    } finally {
      setWeatherLoading(false);
    }
  }

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    await searchCities(query.trim());
  }

  async function handleSelect(city: CityOption) {
    setSelectedCity(city);
    setQuery(city.name);
    setSuggestions([]);
    await updateWeather(city);
  }

  useEffect(() => {
    let active = true;

    async function init() {
      const initialSuggestions = await searchCities(DEFAULT_CITY);

      if (active && initialSuggestions[0]) {
        await handleSelect(initialSuggestions[0]);
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCity) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void updateWeather(selectedCity);
    }, WEATHER_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [selectedCity]);

  const theme = weather?.current.theme ?? 'clear';

  return (
    <main className={`page page_theme_${theme}`}>
      <section className="page__hero">
        <div className="page__header">
          <p className="page__eyebrow">Домашнее задание 8-9</p>
          <p className="page__subtitle">
            Прогноз на несколько дней, загрязнение воздуха и обновление каждые три часа.
          </p>
        </div>

        <CitySearch
          query={query}
          suggestions={suggestions}
          loading={searchLoading}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          onSelect={handleSelect}
        />

        {error && <p className="page__status page__status_error">{error}</p>}
        {weatherLoading && <p className="page__status">Загрузка прогноза...</p>}

        {weather && (
          <div className="page__content">
            <WeatherSummary weather={weather} />
            <AirQualityCard weather={weather} />
            <ForecastList forecast={weather.forecast} />
          </div>
        )}
      </section>
    </main>
  );
}
