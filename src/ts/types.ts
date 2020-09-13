export type MainCardImageClassName =
  | 'cloud-storm'
  | 'clouds-sun-rain'
  | 'cloudy'
  | 'cloudy-sun'
  | 'rainbow-cloud'
  | 'rainy-cloud'
  | 'snowy-cloud'
  | 'sunny'
  | 'thunder-cloud'
  | 'thunder-storm';

export interface CardDataProps {
  type: 'A' | 'B';
  degree: number;
  desc?: string;
  humidityDeg?: number;
  weatherImage: MainCardImageClassName;
  day?: string;
  index?: number;
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
  weather: { description: string; main: string }[];
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
