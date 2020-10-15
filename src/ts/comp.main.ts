import {
  QAll,
  transform,
  interval,
  getAndReturnWeatherData,
  delay,
  Q,
  makeInert,
  addEventListenerOnce,
  getWeatherAndCityDataThenSetState,
  task
} from './utils';
import { updateCard } from './comp.card';
import { WeatherResponseMain } from './types';
import state, { setState } from './state';

export default function main() {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;
  const HourliesWrapper = Q('.Main .hourlies-wrapper') as HTMLElement;
  const HourliesToggler = Q('.Main .hourlies-toggler') as HTMLButtonElement;
  const Nav = Q('.Nav') as HTMLElement;
  const TabLinksContainer = Q('.Main nav') as HTMLElement;
  const Next7DaysSection = Q('.Main .scroll-section') as HTMLElement;

  const triggerGetWeatherData = () => {
    if (navigator.onLine && document.visibilityState === 'visible') {
      getAndReturnWeatherData(
        state.latitude as number,
        state.longitude as number
      ).then(({ current, daily, hourly }) => {
        setState({
          current,
          daily,
          tomorrow: daily[0],
          other: daily.find(
            (day) => day.date_string === state.other?.date_string
          ),
          hourly
        });
      });
    }
  };

  HourliesToggler.addEventListener('click', () => {
    HourliesWrapper.classList.toggle('open');
    HourliesToggler.classList.toggle('toggle-close');

    const isOpen = HourliesToggler.classList.contains('toggle-close');

    HourliesToggler.textContent = isOpen ? '✕' : 'hourly';
    HourliesWrapper.style.overflow = 'hidden';
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    makeInert(Next7DaysSection, isOpen);
    makeInert(Nav, isOpen);
    makeInert(TabLinksContainer, isOpen);
    addEventListenerOnce(HourliesWrapper, () => {
      delay(400).then(() => {
        HourliesWrapper.style.overflow = isOpen ? 'auto' : 'hidden';
      });
    });
  });
  HourliesWrapper.addEventListener('click', (e: any) => {
    if (e.target.classList.contains('hourlies-wrapper')) {
      HourliesToggler.click();
    }
  });

  window.onresize = () => {
    if (!HourliesWrapper.classList.contains('open')) {
      const Card = Q<HTMLElement>('.card.type-a');
      const refOffset = Card?.offsetTop! + Card?.offsetHeight!;

      transform(HourliesWrapper, `translateY(${refOffset - 16}px)`);
    }
  };

  window.onresize(window as any);

  if (TabLinks.length) {
    TabLinks.forEach((TabLink, index) =>
      TabLink.addEventListener('click', (e) => {
        e.preventDefault();
        updateTabLink(index, state.other?.date_string as string);
        updateCard({ ...(state as any)[TabLink.id], type: 'A' });
        setState({ activeTabLinkIndex: index });
      })
    );
  }

  //update app weather data every 2 minutes
  interval(() => {
    triggerGetWeatherData();
  }, 300000);

  let getDataTimeout: any = null;
  document.addEventListener('visibilitychange', () => {
    clearTimeout(getDataTimeout);

    if (document.visibilityState === 'visible') {
      getDataTimeout = setTimeout(() => {
        triggerGetWeatherData();
      }, 4000);
    }
  });

  window.addEventListener('popstate', () => {
    const SearchResultsOverlay = Q('.search-results-overlay') as HTMLElement;
    const SideBarToggler = Q('.side-bar-toggler') as HTMLElement;

    const { hash } = window.location;

    const _task = () => {
      if (navigator.onLine) {
        if (hash) {
          const [latitude, longitude] = window.location.hash
            .replace('#', '')
            .split(',')
            .map(parseFloat) ?? [null, null];

          if (!isNaN(latitude) && !isNaN(longitude)) {
            getWeatherAndCityDataThenSetState(latitude, longitude, null);
          }
        } else {
          window.history.replaceState(
            {},
            '',
            `${window.location.pathname}#${state.latitude},${state.longitude}`
          );
        }
      }
    };

    task.assign(_task).execute();

    if (SearchResultsOverlay.classList.contains('show')) {
      SearchResultsOverlay.click();
    }

    if (HourliesWrapper.classList.contains('open')) {
      HourliesWrapper.click();
    }

    if (SideBarToggler.classList.contains('is-open')) {
      SideBarToggler.click();
    }
  });
}

export const updateBody = (weatherMain: WeatherResponseMain) => {
  const Body = document.body;

  const delayTimeout = Body.classList.contains('animate-card-overlay')
    ? 750
    : 350;
  let className: 'primary' | 'secondary' | 'tertiary' = 'primary';

  switch (true) {
    case /clear/i.test(weatherMain):
      className = 'secondary';
      break;
    case /clouds|drizzle|rainy?|snow/i.test(weatherMain):
      className = 'primary';
      break;
    default:
      className = 'tertiary';
  }

  delay(delayTimeout).then(() => {
    Body.className = Body.className.replace(
      /(theme--).*(--0)/,
      `$1${className}$2`
    );
  });
};

export const updateTabLink = (
  activeTabLinkIndex: number,
  textContent?: string
) => {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;
  const TabIndicator = TabLinks[0].previousElementSibling as HTMLSpanElement;

  TabLinks.forEach((TabLink, i) => {
    if (activeTabLinkIndex < TabLinks.length) {
      if (activeTabLinkIndex === i) {
        if (activeTabLinkIndex === 2 && textContent) {
          TabLink.textContent = textContent;
        }

        delay(10).then(() => {
          const { offsetWidth, offsetLeft } = TabLink;

          TabLink.classList.add('active');
          transform(TabIndicator, `translateX(${offsetLeft}px)`);
          TabIndicator.style.width = `${offsetWidth}px`;
        });
      } else {
        TabLink.classList.remove('active');

        if (!/\d+/.test(TabLink.textContent!) && i === 2) {
          TabLink.textContent =
            textContent ?? (state.other?.date_string as string);
        }
      }
    }
  });
};