export type CityOption = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  label: string;
};

export type GeocodingResponseItem = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

export type ForecastItem = {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
};

export type ForecastResponse = {
  list: ForecastItem[];
};

export type AirPollutionResponse = {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }>;
};

export type ForecastDay = {
  date: string;
  weekday: string;
  temperature: number;
  description: string;
  icon: string;
};

export type WeatherTheme = 'clear' | 'clouds' | 'rain' | 'storm' | 'snow' | 'mist';

export type WeatherBundle = {
  locationLabel: string;
  current: {
    temperature: number;
    feelsLike: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    theme: WeatherTheme;
  };
  forecast: ForecastDay[];
  air: {
    aqi: number;
    label: string;
    components: AirPollutionResponse['list'][number]['components'];
  };
  updatedAt: string;
};
