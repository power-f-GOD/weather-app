import '../styles/index.min.css';

import Nav from '../components/Nav.html';
import Home from '../components/Home.html';

import nav from './nav';
import home from './home';

import { render, task } from './utils';

const App = () => {
  return `
  ${Nav}
  <main class='View'>${Home}</main>`;
};

render(App(), document.querySelector('#app'));

nav();
home();

window.ononline = () => {
  task.execute();
}
