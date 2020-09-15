import { Q, addEventListenerOnce, Processor, render, delay } from './utils';

import Main from '../components/Main.html';

import main, {
  getWeatherAndCityDataThenSetState
} from './main';
import { Card } from './card';
import { task } from './utils';

const CardTypeB = Card({
  type: 'B',
  temp: 0.0
});

const processedMain: string = new Processor(Main, [
  {
    match: '%CardTypeA%',
    value: Card({
      type: 'A',
      temp: 0.0,
      description: '...',
      humidity: 0.0
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

  //add inert (polyfill) attribute for accessibility reasons
  Nav.setAttribute('inert', true);

  const mountMain = () => {
    render(processedMain, View, { adjacency: 'beforeend' });
    Home.classList.add('hide');
    addEventListenerOnce(Home, () => {
      View?.removeChild(Home as any);
      Nav.classList.remove('hide');
      Nav.inert = false;
    });
    main();
  };

  const handleButtonClick = () => {
    Button.disabled = true;
    Button.textContent = 'Starting...';

    const locationSuccess = (position: Position) => {
      const { latitude, longitude } = position.coords;

      delay(700).then(() => {
        mountMain();
        delay(700).then(() => {
          getWeatherAndCityDataThenSetState(latitude, longitude, null);
        });
      });
    };

    const locationFailure = () => {
      delay(700).then(() => {
        mountMain();
        delay(700).then(() => {
          getWeatherAndCityDataThenSetState(40.69, -73.96);
        });
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

  if (Button) {
    Button?.addEventListener('click', handleButtonClick);
    Q('.Nav .location')!.addEventListener('click', () => task.execute());
  }
}
