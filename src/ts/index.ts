import '../styles/index.scss';

import Nav from '../components/Nav.html';
import Home from '../components/Home.html';

import { setState } from './state';

import { render, task, Q } from './utils';

import home from './comp.home';

import webpImage from '../images/cloudy-sun.webp';

const webpSupportChecker = Q('.webp-support-checker') as HTMLImageElement;
webpSupportChecker.src = webpImage;
webpSupportChecker.onload = () => {
  import(`../styles/format.webp.scss`);
  document.body.classList.add('webp');
};
webpSupportChecker.onerror = () => {
  import(`../styles/format.png.scss`);
  document.body.classList.add('no-webp');
};

const App = () => {
  return `
  ${Nav}
  <div class='View'>
    ${Home}
  </div>`;
};

render(App(), document.querySelector('#app')!, null, () => {
  home();
});

window.ononline = () => {
  task.execute();
  setState({ isOnline: true });
};

window.onoffline = () => {
  setState({ isOnline: false });
};

if (navigator.serviceWorker && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => {
        console.log('SW registered.');
      })
      .catch(() => {
        console.error('SW registration failed.');
      });
  });
}
