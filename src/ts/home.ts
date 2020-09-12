import { Q, addEventListenerOnce, Processor, render, delay } from './utils';

import Main from '../components/Main.html';

import main from './main';
import { Card } from './crumbs';

const CardTypeB = Card({
  type: 'B',
  day: 'Monday',
  degree: 27,
  weatherImage: 'cloudy-sun'
});

const processMain: string = new Processor(Main, [
  {
    match: '%CardTypeA%',
    value: Card({
      type: 'A',
      degree: 27,
      desc: 'Clouds & Sun',
      humidityDeg: 45,
      weatherImage: 'cloudy-sun'
    })
  },
  {
    match: '%CardTypeB%',
    value: `${CardTypeB}${CardTypeB}${CardTypeB}${CardTypeB}${CardTypeB}`
  }
]).process();

export default function home() {
  const Home = Q('.Home') as HTMLElement;
  const Button = Q('.Home button') as HTMLElement;
  const Nav = Q('.Nav') as HTMLElement | any;

  Nav.setAttribute('inert', true);

  const handleButtonClick = (e: any) => {
    const View = Q('.View');
    // let Main: Element | null = null;

    e.target.disabled = true;
    delay(500).then(() => {
      render(processMain, View, { adjacency: 'beforeend' });
      Home.classList.add('hide');
      addEventListenerOnce(Home, () => {
        View?.removeChild(Home as any);
        Nav.classList.remove('hide');
        Nav.inert = false;
      });

      main();
    });
  };

  if (Button) {
    Button?.addEventListener('click', handleButtonClick);
  }
}
