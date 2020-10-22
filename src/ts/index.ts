import '../styles/index.scss';

import Nav from '../components/Nav.html';
import Home from '../components/Home.html';

import { render, task } from './utils';
import { setState } from './state';

const App = () => {
  return `
  ${Nav}
  <div class='View'>
    ${Home}
  </div>`;
};

render(App(), document.querySelector('#app')!, null, async () => {
  await import('./comp.nav').then(({ default: nav }) => nav());
  import('./comp.home').then(({ default: home }) => home());
});

window.ononline = () => {
  task.execute();
  setState({ isOnline: true });
};

window.onoffline = () => {
  setState({ isOnline: false });
};

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
