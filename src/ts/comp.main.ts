import state, { setState } from './state';

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
import { WeatherResponseMain } from './types';

export default function main() {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;
  const HourliesWrapper = Q('.Main .hourlies-wrapper') as HTMLElement;
  const HourliesToggler = Q('.Main .hourlies-toggler') as HTMLButtonElement;
  const Nav = Q('.Nav') as HTMLElement;
  const TabLinksContainer = Q('.Main nav') as HTMLElement;
  const Next7DaysSection = Q('.Main .daily-list-view') as HTMLElement;

  const triggerGetWeatherData = () => {
    if (navigator.onLine && document.visibilityState === 'visible') {
      getAndReturnWeatherData(
        state.latitude as number,
        state.longitude as number
      ).then(({ current, daily, hourly }) => {
        console.log('daily:', current, daily);
        setState({
          current,
          daily,
          tomorrow: daily[0],
          other: daily.find(
            (day) => day.date_string === state.other?.date_string
          ),
          hourly,
          lastSynced: Date.now()
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
  HourliesWrapper.addEventListener('click', ({ target }: Event) => {
    if ((target as Element).classList.contains('hourlies-wrapper')) {
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
        setState({
          activeTabLinkIndex: index,
          [TabLink.id]: { ...(state as any)[TabLink.id] }
        });
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
      }, 10000);
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

    if (SideBarToggler.classList.contains('is-open')) {
      SideBarToggler.click();
    }
  });
}

export const updateBody = (props: {
  nightMode?: boolean;
  weatherMain?: WeatherResponseMain;
}) => {
  const Body = document.body;
  const MetaTheme = Q("meta[name='theme-color']") as HTMLMetaElement;

  const { nightMode, weatherMain } = props;
  const delayTimeout =
    nightMode !== undefined
      ? 50
      : Body.classList.contains('animate-card-overlay')
      ? 750
      : weatherMain
      ? 350
      : 100;

  delay(delayTimeout).then(() => {
    if (weatherMain) {
      let className: 'primary' | 'secondary' | 'tertiary' = 'primary';

      switch (true) {
        case /clouds|drizzle|rainy?|snow/i.test(
          weatherMain as WeatherResponseMain
        ):
          className = 'primary';
          MetaTheme.content = 'rgb(0, 141, 205)';
          break;
        case /clear/i.test(weatherMain as WeatherResponseMain):
          className = 'secondary';
          MetaTheme.content = 'rgb(154, 138, 0)';
          break;
        default:
          className = 'tertiary';
          MetaTheme.content = 'rgb(128, 128, 128)';
      }

      Body.className = Body.className.replace(
        /(theme--).*(--0)/,
        `$1${className}$2`
      );
    }

    if (nightMode !== undefined) {
      Body.classList[nightMode ? 'add' : 'remove']('night-time');

      if (nightMode) {
        MetaTheme.content = 'rgb(0, 85, 149)';
      }
    }
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
          transform(TabIndicator, `translateX(${offsetLeft - 0.5}px)`);
          TabIndicator.style.width = `${offsetWidth + 1}px`;
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
