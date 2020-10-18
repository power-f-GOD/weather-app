import '../styles/index.min.css';

import Nav from '../components/Nav.html';
import Home from '../components/Home.html';

import nav from './comp.nav';
import home from './comp.home';

import { render, task } from './utils';
import { setState } from './state';

const App = () => {
  return `
  ${Nav}
  <div class='View'>
    ${Home}
  </div>`;
};

render(App(), document.querySelector('#app')!, null, () => {
  nav();
  home();
});

window.ononline = () => {
  task.execute();
  setState({ isOnline: true });
};

window.onoffline = () => {
  setState({ isOnline: false });
};

if (0 && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => {
        console.log('SW registered: ');
      })
      .catch(() => {
        console.log('SW registration failed: ');
      });
  });
}
