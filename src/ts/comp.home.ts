import state, { setState } from './state';

import {
  Q,
  delay,
  Processor,
  render,
  addEventListenerOnce,
  makeInert,
  getAndReturnWeatherData,
  getWeatherAndCityDataThenSetState,
  task
} from './utils';

import Main from '../components/Main.html';
import Footer from '../components/Footer.html';

import { State } from './types';

export default async function home() {
  const View = Q('.View') as HTMLElement;
  const Home = Q('.Home') as HTMLElement;
  const Explore = Q('.Home button') as HTMLButtonElement;
  const Nav = Q('.Nav') as HTMLElement | any;

  //make Nav initially inert on load of app for accessibility reason(s) as it would be hidden from the view at the time
  makeInert(Nav, true);

  const mountMain = async () => {
    await import(/* webpackPreload: true */ './templates').then(({ Card }) => {
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
          value: Array(7)
            .fill(
              Card({
                type: 'B',
                temp: 0.0
              })
            )
            .join('')
        }
      ]).process();

      render(
        processedMain + Footer,
        View,
        { adjacency: 'beforeend' },
        async () => {
          await import(
            /* webpackPreload: true */ './comp.nav'
          ).then(({ default: nav }) => nav());
          await import(
            /* webpackPreload: true */ './comp.main'
          ).then(({ default: main }: any) => main());
          await import(
            /* webpackPreload: true */ './comp.footer'
          ).then(({ default: footer }: any) => footer());
        }
      );
    });
    Home.classList.add('hide');
    addEventListenerOnce(Home, () => {
      View.removeChild(Home);
      Nav.classList.remove('hide');
      makeInert(Nav, false);
      document.body.style.overflow = 'unset';
    });
  };

  const handleExploreButtonClick = () => {
    Explore.disabled = true;
    Explore.textContent = 'Starting...';

    if (!window.fetch || !window.Promise) {
      alert(
        "Sorry, your browser can't run this app as it is not supported.\n\nUpgrade to a newer version of your browser."
      );
      Explore.disabled = false;
      Explore.textContent = 'Explore';
      return;
    }

    const locationRequestSuccess = async (position: Position) => {
      const { latitude, longitude } = position.coords;

      await delay(700);
      mountMain();
      await delay(1000);
      getWeatherAndCityDataThenSetState(latitude, longitude, null);
    };

    const locationRequestFailure = async () => {
      await delay(700);
      mountMain();
      await delay(1000);
      getWeatherAndCityDataThenSetState(40.69, -73.96);
    };

    const locationRequestOptions = {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    };

    navigator.geolocation.getCurrentPosition(
      locationRequestSuccess,
      locationRequestFailure,
      locationRequestOptions
    );
  };

  if (Explore) {
    Explore.addEventListener('click', handleExploreButtonClick);
    Q('.Nav .location')!.addEventListener('click', () => task.execute());
  }

  //load appState from localStorage if present
  if (navigator.cookieEnabled) {
    const weatherAppState: Omit<State, 'setState'> = JSON.parse(
      localStorage.weatherAppState ?? '{}'
    );

    if (weatherAppState.location) {
      await delay(1000);
      mountMain();
      await delay(1200);
      setState({
        ...weatherAppState,
        location: {
          ...weatherAppState.location,
          err: false,
          statusText: null
        },
        nightMode: undefined
      });
      await delay(2000);

      //update weather data on app load/reload as previous data (from localStorage) might be stale
      if (navigator.onLine) {
        getAndReturnWeatherData(state.latitude!, state.longitude!).then(
          ({ current, daily }) => {
            if (daily.length) {
              setState({
                current,
                daily,
                tomorrow: daily[0],
                other: daily.find(
                  (day) => day.date_string === state.other?.date_string
                ),
                lastSynced: Date.now(),
                isOnline: true
              });
            }
          }
        );
      }
    }
  }
}
