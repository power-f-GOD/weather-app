import { QAll, getData, setState, task } from './utils';
import { WeatherResponseProps, CitiesResponse } from './types';

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

export const getWeatherAndCityDataThenSetState = (
  latitude: number,
  longitude: number,
  location?: string | null
) => {
  setState({
    latitude,
    longitude,
    location: { text: 'Getting weather data...' },
    err: false
  });

  let _task = async () => {
    try {
      const data: WeatherResponseProps = await getData(
        'https://api.openweathermap.org/data/2.5/onecall',
        `lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=cb63632ad608cb4a62e629457f522c6e`
      );
      const { current, daily } = data ?? {};
      console.log(longitude, latitude, location, 'data......', data);

      setState({
        current,
        daily,
        location: {
          text:
            location === undefined
              ? 'New York, US'
              : location === null
              ? 'Getting city name...'
              : location,
          err: false
        }
      });

      if (!location && location === null) {
        _task = async () => {
          setState({
            location: {
              text: 'Getting city name...',
              err: false
            }
          });

          try {
          } catch (e) {}
          const locationData: CitiesResponse = await getData(
            'https://geocode.xyz/',
            `locate=${latitude},${longitude}&geoit=json`
          ).catch(catchGetRequest);
          const { city, prov } = locationData ?? {};

          setState({
            location: {
              text: city
                ? `${city}, ${prov}`
                : "Couldn't get city name. Tap here to retry.",
              err: !city
            }
          });

          if (city) {
            task.erase();
          }
        };

        task.assign(_task);
        task.execute();
      } else if (daily.length) {
        task.erase();
      }
    } catch (e) {
      catchGetRequest(e);
    }
  };

  task.assign(_task);
  return _task();
};

export const catchGetRequest = (e?: any) => {
  const err = String(e);

  if (/fetch|network|promise/i.test(err)) {
    alert(
      `${
        !navigator.onLine
          ? "Couldn't fetch. You're offline."
          : "A network error occurred. Sure you're connected?"
      } `
    );
  }

  console.log('eeeee:', e);
  setState({
    location: { text: '⚠ An error occurred. Tap here to retry.', err: true }
  });
};
