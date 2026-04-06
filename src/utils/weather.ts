import type {
  AirPollutionResponse,
  CityOption,
  ForecastDay,
  ForecastItem,
  GeocodingResponseItem,
  WeatherTheme,
} from '../types';

export function formatLocationLabel(city: CityOption | GeocodingResponseItem): string {
  const statePart = city.state ? `, ${city.state}` : '';
  return `${city.name}${statePart}, ${city.country}`;
}

export function getWeatherTheme(weatherId: number): WeatherTheme {
  if (weatherId >= 200 && weatherId < 300) {
    return 'storm';
  }

  if (weatherId >= 300 && weatherId < 600) {
    return 'rain';
  }

  if (weatherId >= 600 && weatherId < 700) {
    return 'snow';
  }

  if (weatherId >= 700 && weatherId < 800) {
    return 'mist';
  }

  if (weatherId === 800) {
    return 'clear';
  }

  return 'clouds';
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function getAirQualityLabel(aqi: number): string {
  switch (aqi) {
    case 1:
      return 'Хороший';
    case 2:
      return 'Умеренный';
    case 3:
      return 'Немного загрязнён';
    case 4:
      return 'Плохой';
    default:
      return 'Очень плохой';
  }
}

function getTimeDistanceFromNoon(dateText: string): number {
  const hour = Number(dateText.slice(11, 13));
  return Math.abs(12 - hour);
}

export function buildForecastDays(list: ForecastItem[]): ForecastDay[] {
  const byDay = new Map<string, ForecastItem[]>();

  for (const item of list) {
    const dayKey = item.dt_txt.slice(0, 10);
    const dayItems = byDay.get(dayKey);

    if (dayItems) {
      dayItems.push(item);
    } else {
      byDay.set(dayKey, [item]);
    }
  }

  return Array.from(byDay.entries())
    .slice(0, 5)
    .map(([date, items]) => {
      const selected = [...items].sort(
        (left, right) =>
          getTimeDistanceFromNoon(left.dt_txt) - getTimeDistanceFromNoon(right.dt_txt),
      )[0];
      const weather = selected.weather[0];

      return {
        date,
        weekday: new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(
          new Date(selected.dt * 1000),
        ),
        temperature: Math.round(selected.main.temp),
        description: weather?.description ?? '',
        icon: weather?.icon ?? '',
      };
    });
}

export function buildAirSummary(entry: AirPollutionResponse['list'][number] | undefined) {
  const aqi = entry?.main.aqi ?? 1;

  return {
    aqi,
    label: getAirQualityLabel(aqi),
    components: entry?.components ?? {
      co: 0,
      no: 0,
      no2: 0,
      o3: 0,
      so2: 0,
      pm2_5: 0,
      pm10: 0,
      nh3: 0,
    },
  };
}
