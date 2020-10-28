import '../styles/index.scss';

import Nav from '../components/Nav.html';
import Home from '../components/Home.html';

import { setState } from './state';

import { render, task } from './utils';

import home from './comp.home';

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

//remove 0 in expression eventually
if (0 && navigator.serviceWorker) {
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
