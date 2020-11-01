import { CardDataProps } from './types';

export const Card = (props: CardDataProps) => {
  const { type, temp, description, humidity } = props;

  switch (type) {
    case 'A':
      return `
      <div class="card type-a condition--cloudy-sun--0" aria-live="polite">
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
        <div class='thermometer-wrapper'>
          <div class='thermometer therm--cold--0'></div>
          <div class='danger-zone'></div>
          <span>°C</span>
        </div>
        <div class="desc-wrapper text-left">
          <p class="desc">${description}</p>
          <p class="humidity">Humidity</p>
          <p class="humidity-deg">${humidity}%</p>
          <div class="weather-image" role="img"></div>
        </div>
      </div>
    `;
    case 'B':
      return `
      <a href='/other' class="card type-b condition--cloudy-sun--0" role='list-item'>
        <h3>...</h3>
        <div class="weather-image" role="img"></div>
        <p>${temp}&deg;</p>
      </a>`;
    case 'C':
      return `
      <div class='hourly-wrapper card condition--cloudy-sun--0 fade-in' role='list-item'>
        <div class="temp-meter therm--cold--0"></div>
        <div class="hour">00:00<sup>...</sup></div>
        <div class="weather-image" role="img" aria-label="weather icon"></div>
        <p class="main">...</p>
        <div class="temp">0&deg;</div>
      </div>`;
  }
};

export const SearchResult = (props: {
  longitude: number;
  latitude: number;
  location: string;
  type: string;
}) => {
  let { longitude, latitude, location, type } = props;

  location = location
    .split(',')
    .map((word) => word.trim())
    .join(', ');

  return `
  <a href="/#${latitude},${longitude}" 
    class="search-result fulfilled"
    role='list-item'
    data-longitude='${longitude}' 
    data-latitude='${latitude}'
    data-location='${location}'
    data-type='${type}'
    arial-label='search result'>
    <p class="location">${location}</p>
    <p class="type">${type}</p>
  </a>`;
};
