import { Q, QAll } from './utils';
import { CardDataProps } from './types';

export const Card = (props: CardDataProps) => {
  const { type, degree, desc, humidityDeg, weatherImage, day } = props;

  switch (type) {
    case 'A':
      return `
      <div class="card type-a condition--${weatherImage}--0">
        <h1>${degree}&deg;</h1>
        <div class="text-left">
          <p class="desc">${desc}</p>
          <p class="humidity">Humidity</p>
          <p class="humidity-deg">${humidityDeg}&deg;</p>
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
  const { type, degree, desc, humidityDeg, weatherImage, day, index } = props;

  switch (type) {
    case 'A':
      {
        const Card = Q('.card.type-a') as HTMLElement;
        const Degree = Q('.card.type-a h1');
        const Desc = Q('.card.type-a .desc');
        const HumidityDeg = Q('.card.type-a .humidity-deg');

        if (Card && Degree && Desc && HumidityDeg) {
          Degree.textContent = degree + '°';
          Desc.textContent = desc as string;
          HumidityDeg.textContent = humidityDeg + '°';

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
