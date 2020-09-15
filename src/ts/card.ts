import { Q, QAll, formatDate, getMappedImageString } from './utils';
import { CardDataProps, TempDaily, WeatherResponseMain } from './types';

export const Card = (props: CardDataProps) => {
  const { type, temp, description, humidity } = props;

  switch (type) {
    case 'A':
      return `
      <div class="card type-a condition--cloudy-sun--0">
        <div class='top'>
          <p class='feels-like-container'>
            <span>feels like<span>
            <br />
            <span class='feels-like'>0&deg;<span>
          </p>
          <p class='wind-speed-container'>
            <span>wind speed<span>
            <br />
            <span class='wind-speed'>0 m/s<span>
          </p>
        </div>
        <h1>${temp}&deg;</h1>
        <div class="desc-wrapper text-left">
          <p class="desc">${description}</p>
          <p class="humidity">Humidity</p>
          <p class="humidity-deg">${humidity}%</p>
          <div class="weather-image"></div>
        </div>
      </div>
    `;
    case 'B':
      return `
      <div class="card type-b condition--cloudy-sun--0 animate">
        <h3>...</h3>
        <div class="weather-image"></div>
        <p>${temp}&deg;</p>
      </div>`;
  }
};

export function updateCard(props: CardDataProps) {
  const { type, current, index } = props ?? {};
  let { temp, weather, humidity, dt, feels_like, wind_speed } =
    current ?? props ?? {};
  const { description, main } = weather?.slice(-1)[0] ?? {};

  const weatherImage = getMappedImageString(
    main as WeatherResponseMain,
    description as string
  );

  const round = (num?: number) => {
    return Number(num?.toFixed(1));
  };

  switch (type) {
    case 'A':
      {
        const Card = Q('.card.type-a') as HTMLElement;
        const FeelsLike = Q('.card.type-a .feels-like') as HTMLElement;
        const WindSpeed = Q('.card.type-a .wind-speed') as HTMLElement;
        const Degree = Q('.card.type-a h1');
        const Desc = Q('.card.type-a .desc');
        const HumidityDeg = Q('.card.type-a .humidity-deg');

        const weatherForToday =
          new Date(Number(`${dt}000`)).toDateString() ===
          new Date().toDateString();
        const currentHr = new Date(Date.now()).getHours();
        const isNightTime = currentHr >= 19 || currentHr < 7;

        if (Card && Degree && Desc && HumidityDeg && FeelsLike && WindSpeed) {
          FeelsLike.textContent = round(feels_like as number) + '°';
          WindSpeed.textContent = round(wind_speed) + ' m/s';
          Degree.textContent = round(temp as number) + '°';
          Desc.textContent = (description![0].toUpperCase() +
            description!.slice(1)) as string;
          HumidityDeg.textContent = round(humidity) + '%';
          Card.classList.add('animate');

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
          }
        }
      }
      break;
    case 'B':
      {
        const Card = QAll('.card.type-b')[index ?? 0];
        const Day = QAll('.card.type-b h3')[index ?? 0];
        const Degree = QAll('.card.type-b p')[index ?? 0];

        temp = temp as TempDaily;

        const _temp = (temp.max + temp.min) / 2;
        const date = formatDate(dt as number);

        if (Card && Day && Degree) {
          Day.textContent = date ?? 'Monday';
          Degree.textContent = round(_temp) + '°';

          if (/condition--/.test(Card.className)) {
            Card.className = Card.className.replace(
              /(condition--).*(--0)/,
              `$1${weatherImage}$2`
            );
          } else {
            Card.classList.add(`condition--${weatherImage}--0`);
          }
        }
      }
      break;
  }
}
