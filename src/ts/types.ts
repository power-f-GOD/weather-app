export interface State extends Partial<WeatherResponseProps & CitiesResponse> {
  tomorrow?: WeatherResponseProps['current'];
  other?: WeatherResponseProps['current'];
  latitude: number;
  longitute: number;
  location: { text: string; err: boolean };
  setState(val: Omit<State, 'setState'>): Promise<Omit<State, 'setState'>>;
  [key: string]: any;
}

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

export interface CardDataProps
  extends Partial<WeatherInfoProps & WeatherResponseProps> {
  type: 'A' | 'B';
  description?: string;
  index?: number;
}

export interface ProcessorProps {
  entry: string;
  helper: { match: string; value: string | any }[];
}

export interface Task {
  task: Function;
  assign(process: Function): Task;
  execute(reset?: boolean): void;
  erase: Function;
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
  // timezone: string;
}

export interface WeatherInfoProps {
  clouds: number;
  dew_point: number;
  dt: number;
  feels_like: number | FeelsLikeDaily;
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
  date_string: string;
}

export interface TempDaily {
  day: number;
  eve: number;
  max: number;
  min: number;
  morn: number;
  night: number;
}

export interface FeelsLikeDaily {
  day: number;
  eve: number;
  morn: number;
  night: number;
}
