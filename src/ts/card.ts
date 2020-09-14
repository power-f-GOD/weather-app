import { Q, QAll } from './utils';
import { CardDataProps } from './types';

export const Card = (props: CardDataProps) => {
  const { type, degree, desc, humidityDeg, weatherImage, day } = props;

  switch (type) {
    case 'A':
      return `
      <div class="card type-a condition--${weatherImage}--0">
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
        <h1>${degree}&deg;</h1>
        <div class="desc-wrapper text-left">
          <p class="desc">${desc}</p>
          <p class="humidity">Humidity</p>
          <p class="humidity-deg">${humidityDeg}%</p>
          <div class="weather-image"></div>
        </div>
      </div>
    `;
    case 'B':
      return `
      <div class="card type-b condition--${weatherImage}--0">
        <h3>${day}</h3>
        <div class="weather-image"></div>
        <p>${degree}&deg;</p>
      </div>`;
  }
};

export function updateCard(props: CardDataProps) {
  const {
    type,
    degree,
    desc,
    humidityDeg,
    weatherImage,
    feelsLike,
    windSpeed,
    day,
    index,
    weatherForToday,
    isNightTime
  } = props;

  switch (type) {
    case 'A':
      {
        const Card = Q('.card.type-a') as HTMLElement;
        const FeelsLike = Q('.card.type-a .feels-like') as HTMLElement;
        const WindSpeed = Q('.card.type-a .wind-speed') as HTMLElement;
        const Degree = Q('.card.type-a h1');
        const Desc = Q('.card.type-a .desc');
        const HumidityDeg = Q('.card.type-a .humidity-deg');

        if (Card && Degree && Desc && HumidityDeg && FeelsLike && WindSpeed) {
          FeelsLike.textContent = feelsLike + '°';
          WindSpeed.textContent = windSpeed + ' m/s';
          Degree.textContent = degree + '°';
          Desc.textContent = desc as string;
          HumidityDeg.textContent = humidityDeg + '%';
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
        // const Desc = QAll('.card.type-a .desc');
        // const HumidityDeg = QAll('.card.type-a .humidity-deg');

        if (Card && Day && Degree) {
          Day.textContent = day ?? 'Monday';
          Degree.textContent = degree + '°';

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
