import {
  Q,
  addEventListenerOnce,
  Processor,
  render,
  getData,
  delay
} from './utils';

import Main from '../components/Main.html';

import main, { catchGetRequest, getWeatherInfoThenPopulateUI } from './main';
import { Card } from './card';
import { CitiesResponse } from './types';
import { task } from './utils';

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
  const CityLocation = Q('.Nav .location') as HTMLElement;

  Nav.setAttribute('inert', true);

  const mountMain = () => {
    render(processMain, View, { adjacency: 'beforeend' });
    Home.classList.add('hide');
    addEventListenerOnce(Home, () => {
      View?.removeChild(Home as any);
      Nav.classList.remove('hide');
      Nav.inert = false;
    });
    main();
  };

  const handleButtonClick = () => {
    let _task = () => {};

    Button.disabled = true;
    Button.textContent = 'Starting...';

    const locationSuccess = (position: Position) => {
      const { latitude, longitude } = position.coords;

      _task = () => {
        getWeatherInfoThenPopulateUI(
          latitude,
          longitude,
          `Getting city name...`
        )
          .then(() => {
            getData(
              'https://geocode.xyz/',
              `locate=${latitude},${longitude}&geoit=json`
            ).then((data: CitiesResponse) => {
              const { city, prov } = data ?? {};

              CityLocation.classList[city ? 'remove' : 'add']('error');
              CityLocation.textContent = city
                ? `${city}, ${prov}`
                : "Couldn't get city name. Tap here to retry.";

              if (city) {
                task.erase();
              }
            });
          })
          .catch(() => {
            catchGetRequest();
            Button.disabled = false;
          });
      };

      delay(700).then(() => {
        mountMain();
        task.execute();
      });
      task.add(_task);
    };

    const locationFailure = () => {
      delay(700).then(() => {
        mountMain();
        _task = () =>
          getWeatherInfoThenPopulateUI(40.69, -73.96, 'New York, US')
            .then(() => task.erase())
            .catch(() => {
              catchGetRequest();
              Button.disabled = false;
            });
        task.add(_task);
        task.execute();
      });
    };

    const locationOptions = {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    };

    navigator.geolocation.getCurrentPosition(
      locationSuccess,
      locationFailure,
      locationOptions
    );
  };

  if (Button && CityLocation) {
    Button?.addEventListener('click', handleButtonClick);
    CityLocation.addEventListener('click', () => task.execute());
  }
}
