import { getWeatherIconUrl } from '../utils/weather';
import type { WeatherBundle } from '../types';
import './WeatherSummary.css';

type WeatherSummaryProps = {
  weather: WeatherBundle;
};

export function WeatherSummary({ weather }: WeatherSummaryProps) {
  return (
    <section className="weather-summary">
      <div>
        <p className="weather-summary__eyebrow">Текущая погода</p>
        <h1 className="weather-summary__title">{weather.locationLabel}</h1>
        <p className="weather-summary__description">{weather.current.description}</p>
        <p className="weather-summary__meta">Обновлено в {weather.updatedAt}</p>
      </div>

      <div className="weather-summary__main">
        <img
          className="weather-summary__icon"
          src={getWeatherIconUrl(weather.current.icon)}
          alt={weather.current.description}
        />
        <div>
          <p className="weather-summary__temperature">{weather.current.temperature}°C</p>
          <p className="weather-summary__details">
            Ощущается как {weather.current.feelsLike}°C, влажность {weather.current.humidity}%,
            ветер {weather.current.windSpeed} м/с
          </p>
        </div>
      </div>
    </section>
  );
}
