import {
  Q,
  QAll,
  getMappedImageString,
  setState,
  state,
  round,
  delay,
  addEventListenerOnce
} from './utils';
import { CardDataProps, WeatherResponseMain } from './types';

export async function updateCard(props: CardDataProps) {
  const { type, current, tomorrow, other, index } = props ?? {};
  let { temp, weather, humidity, dt, feels_like, wind_speed, date_string } =
    current || tomorrow || other || props || {};
  const { description, main } = weather?.slice(-1)[0] ?? props;

  const weatherImage = getMappedImageString(
    main as WeatherResponseMain,
    description as string
  );

  switch (type) {
    case 'A':
      {
        const Card = Q('.card.type-a') as HTMLElement;
        const FeelsLike = Q('.card.type-a .feels-like') as HTMLElement;
        const WindSpeed = Q('.card.type-a .wind-speed') as HTMLElement;
        const Degree = Q('.card.type-a h1');
        const Thermometer = Q('.card.type-a .thermometer') as HTMLElement;
        const Desc = Q('.card.type-a .desc');
        const HumidityDeg = Q('.card.type-a .humidity-deg');

        if (Card.classList.contains('animate-cover')) {
          await delay(600);
          Card.classList.remove('animate-cover');
        }

        const weatherForToday =
          new Date(Number(`${dt}000`)).toDateString() ===
          new Date().toDateString();
        const currentHr = new Date(Date.now()).getHours();
        const isNightTime = currentHr >= 19 || currentHr < 7;
        const celsiusValue = round(temp as number);
        const feel =
          celsiusValue < 20 ? 'cold' : celsiusValue < 40 ? 'warm' : 'hot';

        if (Card && Degree && Desc && HumidityDeg && FeelsLike && WindSpeed) {
          addEventListenerOnce(
            Card,
            () => Card.classList.remove('animate-cover'),
            'animationend'
          );
          await delay(20);
          Card.classList.add('animate-cover');
          await delay(450);

          FeelsLike.textContent = round(feels_like as number) + '°';
          WindSpeed.textContent = round(wind_speed) + ' m/s';
          Degree.textContent = celsiusValue + '°';
          Thermometer.style.minHeight = celsiusValue + '%';
          Desc.textContent = (description![0].toUpperCase() +
            description!.slice(1)) as string;
          HumidityDeg.textContent = round(humidity) + '%';
          Card.classList.add('animate');

          if (/therm--/.test(Thermometer.className)) {
            Thermometer.className = Thermometer.className.replace(
              /(therm--).*(--0)/,
              `$1${feel}$2`
            );
          } else {
            Thermometer.classList.add(`therm--${feel}--0`);
          }

          if (/condition--/.test(Card.className)) {
            Card.className = Card.className.replace(
              /(condition--).*(--0)/,
              `$1${weatherImage}$2`
            );
          } else {
            Card.classList.add(`condition--${weatherImage}--0`);
          }

          if (weatherForToday && isNightTime) {
            Card.classList.add('night-time');
          } else {
            Card.classList.remove('night-time');
          }
        }
      }
      break;
    case 'B':
      {
        const Card = QAll('.card.type-b')[index ?? 0] as HTMLElement;
        const Day = QAll('.card.type-b h3')[index ?? 0];
        const Degree = QAll('.card.type-b p')[index ?? 0];

        if (Card && Day && Degree) {
          Day.textContent = date_string ?? 'Monday';
          Degree.textContent = round(temp as number) + '°';

          if (/condition--/.test(Card.className)) {
            Card.className = Card.className.replace(
              /(condition--).*(--0)/,
              `$1${weatherImage}$2`
            );
          } else {
            Card.classList.add(`condition--${weatherImage}--0`);
          }
        }

        Card.onclick = (e: any) => {
          e.preventDefault();

          if (index! > 0) {
            setState({
              other: { ...state.daily![index as number] },
              activeTabLinkIndex: 2
            });
          } else {
            updateCard({ ...state.tomorrow, type: 'A' });
            setState({ activeTabLinkIndex: 1 });
          }
        };
      }
      break;
  }
}
