import {
  Q,
  addEventListenerOnce,
  Processor,
  render,
  getData,
  delay,
  formatDate,
  getMappedImageString
} from './utils';

import Main from '../components/Main.html';

import main from './main';
import { Card, updateCard } from './card';
import { WeatherResponseProps, TempDaily } from './types';

const CardTypeB = Card({
  type: 'B',
  day: '...',
  degree: 0.0,
  weatherImage: 'cloudy-sun'
});

const processMain: string = new Processor(Main, [
  {
    match: '%CardTypeA%',
    value: Card({
      type: 'A',
      degree: 0.0,
      desc: '...',
      humidityDeg: 0.0,
      weatherImage: 'cloudy-sun'
    })
  },
  {
    match: '%CardTypeB%',
    value: `${CardTypeB}${CardTypeB}${CardTypeB}${CardTypeB}${CardTypeB}${CardTypeB}${CardTypeB}`
  }
]).process();

export default function home() {
  const View = Q('.View') as HTMLElement;
  const Home = Q('.Home') as HTMLElement;
  const Button = Q('.Home button') as HTMLButtonElement;
  const Nav = Q('.Nav') as HTMLElement | any;

  Nav.setAttribute('inert', true);

  const getWeatherInfoThenPopulateUI = (
    latitude: number,
    longitude: number,
    location?: string
  ) => {
    return getData(
      'https://api.openweathermap.org/data/2.5/onecall',
      `lat=${latitude}&lon=${longitude}&
    exclude=daily&units=metric&appid=cb63632ad608cb4a62e629457f522c6e`
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

      Button.textContent = 'All set!';
      delay(800).then(() => {
        const currentHr = new Date(Date.now()).getHours();
        // console.log(longitude, latitude, location, 'data......', data);
        location;
        render(processMain, View, { adjacency: 'beforeend' });
        Home.classList.add('hide');
        addEventListenerOnce(Home, () => {
          View?.removeChild(Home as any);
          Nav.classList.remove('hide');
          Nav.inert = false;
        });

        updateCard({
          degree: degree as number,
          desc: desc[0].toUpperCase() + desc.slice(1),
          humidityDeg,
          windSpeed: wind_speed,
          feelsLike: Number(feels_like.toFixed(1)),
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
          const degree = Number(((temp.max + temp.min) / 2).toFixed(1));

          updateCard({
            degree,
            index,
            day: formatDate(dt),
            type: 'B',
            weatherImage: getMappedImageString(_main, desc)
          });
        });
        main();
      });
    });
  };

  const catchGetRequest = () => {
    alert(
      `${
        !navigator.onLine
          ? "Couldn't fetch. You're offline."
          : "A network error occurred. Sure you're connected?"
      } `
    );
    Button.disabled = false;
    Button.textContent = 'EXPLORE';
  };

  const handleButtonClick = () => {
    Button.disabled = true;
    Button.textContent = 'Please, wait...';
    navigator.geolocation.getCurrentPosition(
      (position: Position) => {
        const { latitude, longitude } = position.coords;

        getWeatherInfoThenPopulateUI(latitude, longitude).catch(
          catchGetRequest
        );
      },
      () => {
        getWeatherInfoThenPopulateUI(40.69, -73.96, 'New York, US').catch(
          catchGetRequest
        );
      }
    );
  };

  if (Button) {
    Button?.addEventListener('click', handleButtonClick);
  }
}
