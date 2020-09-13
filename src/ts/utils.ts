import { ProcessorProps } from './types';

export const Q = document.querySelector.bind(document);
export const QAll = document.querySelectorAll.bind(document);
export const getByClass = document.getElementsByClassName.bind(document);
export const getById = document.getElementsByClassName.bind(document);

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

// export function interval(
//   callback: Function,
//   _interval: number,
//   clearCallback?: Function
// ): Promise<number> {
//   if (isNaN(_interval))
//     throw Error(
//       "'interval' expects a time [number] in milliseconds as parameter."
//     );

//   return new Promise((resolve: Function) => {
//     let start = 0;
//     let id = _requestAnimationFrame(animate);
//     let clear = false;

//     function animate(timestamp: number) {
//       if (!start) start = timestamp;

//       let timeElapsed = timestamp - start;

//       if (!clear) id = _requestAnimationFrame(animate);
//       else resolve(id);

//       if (timeElapsed % _interval < 17 && timeElapsed > _interval) {
//         callback();
//         clear = clearCallback ? clearCallback() : false;
//       }
//     }
//   });
// }

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
