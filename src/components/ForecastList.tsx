import { getWeatherIconUrl } from '../utils/weather';
import type { ForecastDay } from '../types';
import './ForecastList.css';

type ForecastListProps = {
  forecast: ForecastDay[];
};

export function ForecastList({ forecast }: ForecastListProps) {
  return (
    <section className="forecast-list">
      <div className="forecast-list__header">
        <h2 className="forecast-list__title">Прогноз на несколько дней</h2>
      </div>

      <div className="forecast-list__grid">
        {forecast.map((day) => (
          <article key={day.date} className="forecast-list__card">
            <p className="forecast-list__weekday">{day.weekday}</p>
            <p className="forecast-list__date">{day.date}</p>
            <img
              className="forecast-list__icon"
              src={getWeatherIconUrl(day.icon)}
              alt={day.description}
            />
            <p className="forecast-list__temperature">{day.temperature}°C</p>
            <p className="forecast-list__description">{day.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
