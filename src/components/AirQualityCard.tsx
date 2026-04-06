import type { WeatherBundle } from '../types';
import './AirQualityCard.css';

type AirQualityCardProps = {
  weather: WeatherBundle;
};

export function AirQualityCard({ weather }: AirQualityCardProps) {
  const { air } = weather;

  return (
    <section className="air-quality">
      <h2 className="air-quality__title">Качество воздуха</h2>
      <p className="air-quality__aqi">
        AQI {air.aqi}: {air.label}
      </p>
      <div className="air-quality__grid">
        <div className="air-quality__item">
          <span>PM2.5</span>
          <strong>{air.components.pm2_5}</strong>
        </div>
        <div className="air-quality__item">
          <span>PM10</span>
          <strong>{air.components.pm10}</strong>
        </div>
        <div className="air-quality__item">
          <span>O₃</span>
          <strong>{air.components.o3}</strong>
        </div>
        <div className="air-quality__item">
          <span>NO₂</span>
          <strong>{air.components.no2}</strong>
        </div>
      </div>
    </section>
  );
}
