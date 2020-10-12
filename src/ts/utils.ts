import {
  ProcessorProps,
  WeatherImageClassName,
  WeatherResponseMain,
  State,
  WeatherResponseProps,
  Task,
  CitiesResponse,
  WeatherInfoProps
} from './types';
import { updateCard } from './card';
import { updateLocation } from './nav';
import { updateTabLink } from './main';

export const Q = document.querySelector.bind(document);
export const QAll = document.querySelectorAll.bind(document);
export const getByClass = document.getElementsByClassName.bind(document);
export const getById = document.getElementsByClassName.bind(document);

export const state: Readonly<Pick<State, 'setState'>> &
  Omit<State, 'setState'> = {
  latitude: 40.69,
  longitude: -73.96,
  location: { text: 'New York, US', err: false },
  setState(val: Omit<State, 'setState'>) {
    return new Promise((resolve) => {
      const {
        location: _location,
        current,
        daily,
        tomorrow,
        other,
        hourly,
        activeTabLinkIndex
      } = val;
      let activeTab = current;

      switch (activeTabLinkIndex || state.activeTabLinkIndex) {
        case 1:
          activeTab = tomorrow;
          break;
        case 2:
          activeTab = other;
          break;
        default:
          activeTab = current;
      }

      //update UI...
      if (_location) {
        updateLocation(_location.text ?? state.location?.text, _location.err);
      }

      if (activeTabLinkIndex !== undefined) {
        updateTabLink(activeTabLinkIndex, (other ?? state.other)?.date_string);
      }

      if (current || tomorrow || other) {
        updateCard({ ...activeTab, type: 'A' });
      }

      if (daily) {
        daily.map((data: WeatherInfoProps, index: number) => {
          updateCard({
            ...data,
            index,
            type: 'B'
          });
        });
      }

      if (hourly) {
        hourly.map((data: WeatherInfoProps, index: number) => {
          updateCard({
            ...data,
            index,
            type: 'C'
          });
        });
      }

      //update state
      for (const [key, value] of Object.entries(val)) {
        (state as any)[key] =
          Array.isArray(value) || /string|number/.test(typeof value)
            ? value
            : { ...(state as any)[key], ...value };
      }

      //do the next few lines so the setState function is not resolved with state
      const _state = { ...state } as any;

      delete _state.setState;

      if (navigator.cookieEnabled) {
        localStorage.weatherAppState = JSON.stringify(_state);
      }

      resolve(_state);
    });
  }
};

export const setState: State['setState'] = state.setState;

//mainly used for caching failed tasks so they can be 'retried/re-executed' e.g. when an API call is made and there's no internet connection, the task is cached/stored then executed when internet connection is regained
export const task: Readonly<Omit<Task, 'task'>> & { task: Function } = {
  task: () => {},
  assign(_task: Function | any) {
    task.task = _task;
    return task;
  },
  erase() {
    task.task = () => {};
  },
  execute<T>(reset?: boolean): T {
    if (reset) {
      delay(50).then(() => task.erase());
    }

    return task.task();
  }
};

export const getAndReturnWeatherData = async (
  latitude: number,
  longitude: number
) => {
  const { current, daily: _daily, hourly }: WeatherResponseProps =
    (await getData(
      'https://api.openweathermap.org/data/2.5/onecall',
      `lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=cb63632ad608cb4a62e629457f522c6e`
    )) ?? {};
  const daily = _daily?.slice(1).map((day) => {
    const dataset = {
      feels_like: 0,
      wind_speed: 0,
      temp: 0,
      main: '',
      description: '',
      date_string: '',
      dt: 0,
      humidity: 0
    } as WeatherInfoProps & { [key: string]: any };

    let _value: any = 0;

    for (const key in dataset) {
      const datum = (dataset[key] = (day as any)[key]);

      if (/feels_like|temp/.test(key) && datum) {
        const data = dataset[key];
        let value: string | number = 0;
        let length = 0;

        for (const val in data) {
          if (datum === 'temp' && /min|max/.test(val)) {
            continue;
          }

          value += Number(data[val as any]);
          length += 1;
        }

        value /= length;
        _value = value;
      } else {
        let value = datum;

        switch (true) {
          case /description|main/.test(key):
            const { description, main } = day.weather?.slice(-1)[0] ?? {};

            value = key === 'main' ? main : description;
            break;
          case key === 'date_string':
            value = getDateChunk(day.dt).date_string;
            break;
        }

        _value = value;
      }

      dataset[key] = _value;
    }

    return dataset;
  });

  return Promise.resolve({ current, daily, hourly });
};

export const getWeatherAndCityDataThenSetState = (
  latitude: number,
  longitude: number,
  location?: string | null
) => {
  setState({
    latitude,
    longitude,
    location: { text: 'Fetching weather data...', err: false }
  });

  let _task = async () => {
    try {
      const { current, daily, hourly } =
        (await getAndReturnWeatherData(latitude, longitude)) ?? {};

      if (current || daily) {
        setState({
          current,
          tomorrow: daily[0],
          other: daily[1],
          daily,
          hourly,
          activeTabLinkIndex: state.activeTabLinkIndex || 0,
          location: {
            text:
              location === undefined
                ? 'New York, US'
                : location === null
                ? 'Getting location name...'
                : location,
            err: false
          }
        });
      }

      if (!location && location === null) {
        _task = async () => {
          setState({
            location: {
              text: 'Getting location name...',
              err: false
            }
          });

          const { city, prov }: CitiesResponse =
            (await getData(
              'https://geocode.xyz/',
              `locate=${latitude},${longitude}&geoit=json`
            ).catch(catchGetRequest)) ?? {};

          setState({
            location: {
              text: city
                ? `${city}, ${prov}`
                : "Couldn't get location name. Tap here to retry.",
              err: !city
            }
          });

          if (city) {
            task.erase();
          }
        };

        task.assign(_task).execute();
      } else if (daily.length) {
        task.erase();
      }
    } catch (e) {
      catchGetRequest(e);
    }
  };

  return task.assign(_task).execute<Promise<void>>();
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

  setState({
    location: { text: '⚠ An error occurred. Tap here to retry.', err: true }
  });

  console.error(e);
};

export const getMappedImageString = (
  main: WeatherResponseMain,
  desc: string
): WeatherImageClassName => {
  switch (true) {
    case /clear/i.test(main):
      return 'sunny';
    case /thunderstorm/i.test(main):
      return /rain/i.test(desc) ? 'thunder-storm' : 'thunder-cloud';
    case /drizzle|rain/i.test(main):
      return /heavy/i.test(desc) ? 'rainy-cloud' : 'clouds-sun-rain';
    case /snow/i.test(main):
      return 'snowy-cloud';
    case /tornado/i.test(main):
      return 'cloud-storm';
    case /clouds/i.test(main):
      return /few/i.test(desc) ? 'cloudy-sun' : 'cloudy';
    default:
      return 'atmosphere';
  }
};

export const getDateChunk = (dt?: number) => {
  const dateString = new Date(dt ? Number(`${dt}000`) : Date.now()).toString();
  const dArr = dateString.split(' ');
  let [day, month, date, hour] = [dArr[0], dArr[1], dArr[2], dArr[4]];

  hour = hour.replace(/(.*):\d\d/, '$1');

  return {
    hour,
    day,
    date_string: `${month} ${date}`,
    date_time: `${hour}, ${month} ${day}`
  };
};

export const getData = async (baseUrl: string, query: string) => {
  const response = await fetch(`${baseUrl}?${query}`);
  return await response.json();
};

export const round = (num?: number) => {
  return Number(Number(num)?.toFixed(1));
};

export class Processor {
  helper: ProcessorProps['helper'];
  processed: string;

  constructor(entry: string, helper: ProcessorProps['helper']) {
    this.helper = helper;
    this.processed = entry;
  }

  process() {
    if (this.helper.length) {
      this.helper.map(({ match, value }) => {
        this.processed = this.processed.replace(new RegExp(match, 'ig'), value);
        return null;
      });
    }

    return this.processed;
  }
}

//this function is for the purpose of accessibility... basically to make the element or its target inert i.e. hidden from assistive technologies and to remove it from the tab order, and also disable pointer events like mouse clicks or hovers
export const makeInert = (
  target: HTMLElement,
  inert: boolean,
  alsoIncludeChildren?: boolean,
  targetIsInTabOrder?: boolean
) => {
  target.style.pointerEvents = inert ? 'none' : 'unset';
  target.setAttribute('aria-hidden', inert ? 'true' : 'false');

  if (targetIsInTabOrder) {
    target.tabIndex = inert ? -1 : 0;
  }

  if (alsoIncludeChildren) {
    const childrenAnchorTag = target.querySelectorAll('a') as NodeListOf<
      HTMLElement
    >;
    const childrenButtonTag = target.querySelectorAll('button') as NodeListOf<
      HTMLElement
    >;
    const childrenInputTag = target.querySelectorAll('input') as NodeListOf<
      HTMLElement
    >;
    const childrenWithTabIndex = target.querySelectorAll(
      '[tabindex]'
    ) as NodeListOf<HTMLElement>;

    childrenAnchorTag.forEach((tag) => _inert(tag));
    childrenButtonTag.forEach((tag) => _inert(tag));
    childrenInputTag.forEach((tag) => _inert(tag));
    childrenWithTabIndex.forEach((tag) => _inert(tag));
  }

  function _inert(tag: HTMLElement) {
    tag.style.pointerEvents = inert ? 'none' : 'unset';
    tag.setAttribute('aria-hidden', inert ? 'true' : 'false');
    tag.tabIndex = inert ? -1 : 0;
  }
};

export const transform = (el: any, val: string) => {
  el.style.WebkitTransform = val;
  el.style.MozTransform = val;
  el.style.OTransform = val;
  el.style.transform = val;
};

export const render = (
  _content: string | string[] | any,
  target: Element | HTMLElement,
  options?: {
    adjacency?:
      | 'beforeend'
      | 'afterend'
      | 'beforebegin'
      | 'afterbegin'
      | 'replace';
  } | null,
  callback?: Function
) => {
  const content = _content.join ? _content.join('') : (_content as any);
  const { adjacency } = options ?? {};

  switch (true) {
    case target && adjacency && adjacency !== 'replace':
      target.insertAdjacentHTML(adjacency as any, content as any);
      break;
    case target && (adjacency === 'replace' || !adjacency):
      target.innerHTML = content as any;
      break;
    default:
      Q('#app')?.insertAdjacentHTML('beforeend', content as any);
  }

  if (callback) {
    callback();
  }
};

export const addEventListenerOnce = (
  target: HTMLElement | any,
  callback: Function | any,
  event?: string,
  options?: { capture?: boolean; once?: boolean; passive?: boolean }
) => {
  event = event ? event : 'transitionend';

  try {
    target.addEventListener(
      event,
      callback,
      options
        ? {
            ...(options ?? {}),
            once: options.once !== undefined ? options.once : true
          }
        : { once: true }
    );
  } catch (err) {
    target.removeEventListener(
      event,
      callback,
      options?.capture ? true : false
    );
    target.addEventListener(event, callback, options?.capture ? true : false);
  }
};

// (more performant) timers -->

const _requestAnimationFrame = _requestAnimationFrameWrapper();

export function delay(
  timeout: number,
  clearCallback?: Function
): Promise<number> {
  if (isNaN(timeout))
    throw Error(
      "'delay' expects a time [number] in milliseconds as parameter."
    );

  return new Promise((resolve: Function) => {
    let start = 0;
    let id = _requestAnimationFrame(animate);
    let clear = clearCallback ? clearCallback : () => false;

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      let timeElapsed = timestamp - start;

      if (timeElapsed < timeout && !clear())
        id = _requestAnimationFrame(animate);
      else resolve(id);
    }
  });
}

export function interval(
  callback: Function,
  _interval: number,
  clearCallback?: Function
): Promise<number> {
  if (isNaN(_interval))
    throw Error(
      "'interval' expects a time [number] in milliseconds as parameter."
    );

  return new Promise((resolve: Function) => {
    let start = 0;
    let id = _requestAnimationFrame(animate);
    let clear = false;

    function animate(timestamp: number) {
      if (!start) start = timestamp;

      let timeElapsed = timestamp - start;

      if (!clear) id = _requestAnimationFrame(animate);
      else resolve(id);

      if (timeElapsed % _interval < 17 && timeElapsed > _interval) {
        callback();
        clear = clearCallback ? clearCallback() : false;
      }
    }
  });
}

function _requestAnimationFrameWrapper() {
  let previousTime = 0;

  if (window.requestAnimationFrame) return window.requestAnimationFrame;
  return (callback: Function) => {
    /**
     * Credit to Paul Irish (@ www.paulirish.com) for creating/providing this polyfill
     */
    let timestamp = new Date().getTime();
    let timeout = Math.max(0, 16 - (timestamp - previousTime));
    let id = setTimeout(() => {
      callback(timestamp + timeout);
    }, 16); //corrected this line from 'timeout' in actual polyfill to '16' as it made animation slow and jank

    previousTime = timestamp + timeout;

    return id;
  };
}
