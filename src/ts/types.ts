export type WeatherImageClassName =
  | 'cloud-storm'
  | 'clouds-sun-rain'
  | 'cloudy'
  | 'cloudy-sun'
  | 'rainbow-cloud'
  | 'rainy-cloud'
  | 'snowy-cloud'
  | 'sunny'
  | 'thunder-cloud'
  | 'thunder-storm'
  | 'atmosphere';

export type WeatherResponseMain =
  | 'clouds'
  | 'thunderstorm'
  | 'clear'
  | 'drizzle'
  | 'rainy'
  | 'snow'
  | 'tornado'
  | 'fog';

export interface CardDataProps {
  type: 'A' | 'B';
  degree: number;
  desc?: string;
  humidityDeg?: number;
  weatherImage: WeatherImageClassName;
  day?: string;
  index?: number;
  weatherForToday?: boolean;
  isNightTime?: boolean;
  feelsLike?: number;
  windSpeed?: number;
}

export interface ProcessorProps {
  entry: string;
  helper: { match: string; value: string | any }[];
}

export interface CitiesResponse {
  latt: string;
  longt: string;
  match: { latt: string; longt: string; matchtype: string; location: string }[];
  matches: string;
  error: any;
  success: boolean;
  city: string;
  country: string;
  timezone: string;
  prov: string;
}

export interface WeatherResponseProps {
  current: WeatherInfoProps;
  daily: WeatherInfoProps[];
  hourly: WeatherInfoProps[];
  lat: number;
  lon: number;
  timezone: string;
}

export interface WeatherInfoProps {
  clouds: number;
  dew_point: number;
  dt: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  sunrise: number;
  sunset: number;
  temp: number | TempDaily;
  uvi: number;
  visibility: number;
  weather: { description: string; main: WeatherResponseMain }[];
  wind_deg: number;
  wind_speed: number;
}

export interface TempDaily {
  day: number;
  eve: number;
  max: number;
  min: number;
  morn: number;
  night: number;
}
