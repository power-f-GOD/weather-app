import { Q } from './utils';

export default function home() {
  const Button = Q('#Home button');

  const handleButtonClick = () => {
    alert('Alerts Button clicked!');
  };

  if (Button) {
    Button?.addEventListener('click', handleButtonClick);
  }
}
