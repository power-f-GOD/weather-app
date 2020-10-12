import {
  Q,
  QAll,
  requireMappedImageString,
  setState,
  state,
  round,
  delay,
  addEventListenerOnce,
  requireDateChunk
} from './utils';
import { CardDataProps, WeatherResponseMain } from './types';

export async function updateCard(props: CardDataProps) {
  const { type, current, tomorrow, other, index } = props ?? {};
  let { temp, weather, humidity, dt, feels_like, wind_speed, date_string } =
    current || tomorrow || other || props || {};
  const { description, main } = weather?.slice(-1)[0] ?? props;

  const weatherImage = requireMappedImageString(
    main as WeatherResponseMain,
    description as string
  );

  switch (type) {
    case 'A': {
      const Card = Q('.card.type-a') as HTMLElement;
      const FeelsLike = Card.querySelector('.feels-like');
      const WindSpeed = Card.querySelector('.wind-speed');
      const Degree = Card.querySelector('h1');
      const Thermometer = Card.querySelector('.thermometer') as HTMLElement;
      const Desc = Card.querySelector('.desc');
      const HumidityDeg = Card.querySelector('.humidity-deg');

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

      break;
    }
    case 'B': {
      const Card = QAll('.card.type-b')[index ?? 0] as HTMLElement;
      const Day = Card.querySelector('h3');
      const Degree = Card.querySelector('p');

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

      break;
    }
    case 'C': {
      const Card = QAll('.hourly-wrapper')[index ?? 0] as HTMLElement;
      const Hour = Card.querySelector('.hour');
      const Desc = Card.querySelector('.main');
      const Degree = Card.querySelector('.temp');

      const { hour, day } = requireDateChunk(dt);

      if (Card && Hour && Desc && Degree) {
        Hour.innerHTML = `${hour}<sup>${day}</sup>` ?? '...';
        Desc.textContent = main ?? '...';
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
      break;
    }
  }
}
