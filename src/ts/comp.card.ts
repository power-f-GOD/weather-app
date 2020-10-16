import {
  Q,
  QAll,
  requireMappedImageString,
  round,
  delay,
  addEventListenerOnce,
  requireDateChunk
} from './utils';
import { CardDataProps, WeatherResponseMain } from './types';
import state, { setState } from './state';

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
      const Body = document.body;
      const Card = Q('.card.type-a') as HTMLElement;
      const FeelsLike = Card.querySelector('.feels-like');
      const WindSpeed = Card.querySelector('.wind-speed');
      const Degree = Card.querySelector('h1');
      const Thermometer = Card.querySelector('.thermometer') as HTMLElement;
      const Desc = Card.querySelector('.desc');
      const HumidityDeg = Card.querySelector('.humidity-deg');

      if (Body.classList.contains('animate-card-overlay')) {
        await delay(400);
        Body.classList.remove('animate-card-overlay');
      }

      const currentHr = new Date(Date.now()).getHours();
      const isNightTime = currentHr >= 19 || currentHr < 7;
      const celsiusValue = round(temp as number);
      const feel =
        celsiusValue < 20 ? 'cold' : celsiusValue < 40 ? 'warm' : 'hot';

      if (Card && Degree && Desc && HumidityDeg && FeelsLike && WindSpeed) {
        addEventListenerOnce(
          Card,
          () => Body.classList.remove('animate-card-overlay'),
          'animationend'
        );
        await delay(20);
        Body.classList.add('animate-card-overlay');
        await delay(350);

        FeelsLike.textContent = round(feels_like as number) + '°';
        WindSpeed.textContent = round(wind_speed) + ' m/s';
        Degree.textContent = celsiusValue + '°';
        Thermometer.style.minHeight = celsiusValue + '%';
        Desc.textContent = (description![0].toUpperCase() +
          description!.slice(1)) as string;
        HumidityDeg.textContent = round(humidity) + '%';
        Thermometer.className = Thermometer.className.replace(
          /(therm--).*(--0)/,
          `$1${feel}$2`
        );
        Card.className = Card.className.replace(
          /(condition--).*(--0)/,
          `$1${weatherImage}$2`
        );

        if (isNightTime) {
          setState({
            nightMode:
              state.nightMode === undefined ? isNightTime : state.nightMode
          });
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
        Card.className = Card.className.replace(
          /(condition--).*(--0)/,
          `$1${weatherImage}$2`
        );
      }

      Card.onclick = (e: any) => {
        e.preventDefault();

        if (index! > 0) {
          setState({
            other: { ...state.daily![index as number] },
            activeTabLinkIndex: 2
          });
        } else {
          setState({ activeTabLinkIndex: 1, tomorrow: { ...state.tomorrow! } });
        }
      };

      break;
    }
    case 'C': {
      const Card = QAll('.hourly-wrapper')[index ?? 0] as HTMLElement;
      const Hour = Card.querySelector('.hour');
      const Desc = Card.querySelector('.main');
      const Degree = Card.querySelector('.temp');
      const TempMeter = Card.querySelector('.temp-meter') as HTMLElement;

      const { hour, day } = requireDateChunk(dt, true);

      if (Card && Hour && Desc && Degree && TempMeter) {
        const degree = round(temp as number);
        Hour.innerHTML = `${hour}<sup>${day}</sup>` ?? '...';
        Desc.textContent = description ?? '...';
        Degree.textContent = degree + '°';
        TempMeter.style.height = `${degree}%`;
        TempMeter.className = TempMeter.className.replace(
          /(therm--).*(--0)/,
          `$1${degree < 20 ? 'cold' : degree < 40 ? 'warm' : 'hot'}$2`
        );
        Card.className = Card.className.replace(
          /(condition--).*(--0)/,
          `$1${weatherImage}$2`
        );
      }
      break;
    }
  }
}
