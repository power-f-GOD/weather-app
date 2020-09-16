import {
  ProcessorProps,
  WeatherImageClassName,
  WeatherResponseMain,
  State,
  WeatherResponseProps,
  Task
} from './types';
import { updateCard } from './card';
import { updateLocation } from './nav';

export const Q = document.querySelector.bind(document);
export const QAll = document.querySelectorAll.bind(document);
export const getByClass = document.getElementsByClassName.bind(document);
export const getById = document.getElementsByClassName.bind(document);

export const state: State = {
  latitude: 40.69,
  longitute: -73.96,
  location: { text: 'New York, US', err: false },
  setState(val: Omit<State, 'setState'>) {
    return new Promise((resolve) => {
      const { location: _location, current, daily, tomorrow, other } = val;

      if (_location) {
        updateLocation(_location.text || state.location.text, _location.err);
      }

      if (current) {
        updateCard({
          ...current,
          type: 'A'
        });
      }

      if (tomorrow) {
      }

      if (other) {
      }

      if (daily) {
        daily
          ?.slice(1)
          .map((data: WeatherResponseProps['daily'], index: number) => {
            updateCard({
              ...data,
              index,
              type: 'B'
            });
          });
      }

      Object.keys(val).map((key: any) => {
        return (state[key] =
          val[key].length !== undefined
            ? val[key]
            : { ...state[key], ...val[key] });
      });

      //do the next few lines so the setState function is not resolved with state
      const _state = { ...state } as any;

      delete _state.setState;

      if (navigator.cookieEnabled) {
        localStorage.appState = _state;
      }

      resolve(_state);
    });
  }
};

export const setState: State['setState'] = state.setState;

export const task: Task = {
  task: () => {},
  assign(_task: Function | any) {
    task.task = _task;
    return task;
  },
  erase() {
    task.task = () => {};
  },
  execute(reset?: boolean) {
    task.task();

    if (reset) {
      task.erase();
    }
  }
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

export const formatDate = (dt: number) => {
  return new Date(Number(`${dt}000`))
    .toDateString()
    .replace(/(\w+)\s(\w+\s\d{1,2}).*/, '$1, $2');
};

export const getData = (baseUrl: string, query: string) => {
  return fetch(`${baseUrl}?${query}`).then((response) => response.json());
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
        this.processed = this.processed.replace(match, value);
        return null;
      });
    }

    return this.processed;
  }
}

export const render = (
  content: string | string[] | any,
  target: Element | HTMLElement | null,
  options?: {
    adjacency?:
      | 'beforeend'
      | 'afterend'
      | 'beforebegin'
      | 'afterbegin'
      | 'replace';
    callback?: Function;
  }
) => {
  const { adjacency, callback } = options ?? {};

  content = content.join ? content.join('') : (content as any);

  if (target && adjacency && adjacency !== 'replace') {
    target.insertAdjacentHTML(adjacency, content as any);
  } else if (target && (adjacency === 'replace' || !adjacency)) {
    target.innerHTML = content as any;
  } else {
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

// timers -->

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
