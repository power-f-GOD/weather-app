import '../styles/index.min.css';
import '../inert-polyfill.min.js';

import Nav from '../components/Nav.html';
import Home from '../components/Home.html';

import nav from './nav';
import home from './home';

import { render, task } from './utils';

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
};
