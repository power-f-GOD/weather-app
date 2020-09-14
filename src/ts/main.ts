import {
  QAll,
  Q,
  getMappedImageString,
  formatDate,
  getData
} from './utils';
import { WeatherResponseProps, TempDaily } from './types';
import { updateCard } from './card';

export default function main() {
  const TabLinks = QAll('.Main .tab-link');

  const handleLinkClick = (e: any) => {
    e.preventDefault();
    TabLinks.forEach((TabLink) => {
      if (TabLink === e.target) {
        TabLink.classList.add('active');
      } else {
        TabLink.classList.remove('active');
      }
    });
  };

  if (TabLinks.length) {
    TabLinks.forEach((TabLink) =>
      TabLink.addEventListener('click', handleLinkClick)
    );
  }
}

export const getWeatherInfoThenPopulateUI = (
  latitude: number,
  longitude: number,
  location: string
) => {
  const CityLocation = Q('.Nav .location') as HTMLElement;

  CityLocation.classList.remove('error');
  CityLocation.textContent = 'Getting weather data...';
  return getData(
    'https://api.openweathermap.org/data/2.5/onecall',
    `lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=cb63632ad608cb4a62e629457f522c6e`
  ).then((data: WeatherResponseProps) => {
    const { current, daily } = data ?? {};
    let {
      temp: degree,
      weather,
      humidity: humidityDeg,
      dt,
      feels_like,
      wind_speed
    } = current ?? {};
    const { description: desc, main: _main } = weather[0];

    const currentHr = new Date(Date.now()).getHours();
    // console.log(longitude, latitude, location, 'data......', data);

    CityLocation.textContent = location;
    CityLocation.classList.remove('error');
    updateCard({
      desc,
      humidityDeg,
      windSpeed: wind_speed,
      degree: degree as number,
      feelsLike: feels_like,
      type: 'A',
      weatherForToday:
        new Date(Number(`${dt}000`)).toDateString() ===
        new Date().toDateString(),
      isNightTime: currentHr >= 19 || currentHr < 7,
      weatherImage: getMappedImageString(_main, desc)
    });

    daily.slice(1).map(({ temp, dt, weather }, index) => {
      temp = temp as TempDaily;

      const { description: desc, main: _main } = weather[0];
      const degree = (temp.max + temp.min) / 2;

      updateCard({
        degree,
        index,
        day: formatDate(dt),
        type: 'B',
        weatherImage: getMappedImageString(_main, desc)
      });
    });
  });
};

export const catchGetRequest = () => {
  const CityLocation = Q('.Nav .location') as HTMLElement;

  alert(
    `${
      !navigator.onLine
        ? "Couldn't fetch. You're offline."
        : "A network error occurred. Sure you're connected?"
    } `
  );
  CityLocation.classList.add('error');
  CityLocation.textContent = '⚠ An error occurred. Tap here to retry.';
};
