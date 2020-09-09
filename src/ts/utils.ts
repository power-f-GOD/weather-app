export const render = (
  content: string,
  target: HTMLElement | null,
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

  if (target && adjacency && adjacency !== 'replace') {
    target.insertAdjacentHTML(adjacency, content);
  } else if (target && adjacency === 'replace') {
    target.innerHTML = content;
  } else {
    Q('#app')?.insertAdjacentHTML('beforeend', content);
  }

  if (callback) {
    callback();
  }
};

export const Q = document.querySelector.bind(document);
export const QAll = document.querySelectorAll.bind(document);
export const getByClass = document.getElementsByClassName.bind(document);
export const getById = document.getElementsByClassName.bind(document);
