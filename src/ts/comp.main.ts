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
  task,
  render
} from './utils';
import { WeatherResponseMain } from './types';
import { Card } from './templates';

export default function main() {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;
  const HourliesToggler = Q('.Main .hourlies-toggler') as HTMLButtonElement;
  const HourliesWrapper = Q('.Main .hourlies-wrapper') as HTMLElement;
  const HourliesList1 = Q('.hourlies-container-1 .list-view') as HTMLElement;
  const HourliesList2 = Q('.hourlies-container-2 .list-view') as HTMLElement;
  const Nav = Q('.Nav') as HTMLElement;
  const SideBarToggler = Q('.side-bar-toggler') as HTMLElement;
  const TabLinksContainer = Q('.Main nav') as HTMLElement;
  const Next7DaysSection = Q('.Main .daily-list-view') as HTMLElement;

  makeInert(HourliesWrapper, true);

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
          hourly,
          lastSynced: Date.now(),
          isOnline: navigator.onLine
        });
      });
    }
  };

  HourliesToggler.addEventListener('click', () => {
    HourliesWrapper.classList.toggle('open');
    HourliesToggler.classList.toggle('toggle-close');

    const isOpen = HourliesToggler.classList.contains('toggle-close');

    if (!isOpen) {
      setState({ hourliesIsOpen: false });
      render('', HourliesList1);
      render('', HourliesList2);
    }

    HourliesToggler.textContent = isOpen ? '✕' : 'hourly';
    HourliesWrapper.style.overflow = 'hidden';
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';

    makeInert(Nav, isOpen);
    makeInert(TabLinksContainer, isOpen);
    makeInert(HourliesWrapper, !isOpen);
    makeInert(Next7DaysSection, isOpen);
    makeInert(SideBarToggler, isOpen);
    addEventListenerOnce(HourliesWrapper, async () => {
      await delay(400);
      HourliesWrapper.style.overflow = isOpen ? 'auto' : 'hidden';

      if (isOpen) {
        const cardTemplates = Array(48).fill(
          Card({
            type: 'C',
            temp: 0.0,
            main: undefined,
            hour: '00'
          })
        );

        render(cardTemplates.slice(0, 24).join(''), HourliesList1, null, () => {
          render(cardTemplates.slice(24).join(''), HourliesList2, null, () => {
            setState({ hourliesIsOpen: true });
          });
        });
      }
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

      transform(HourliesToggler, `translateY(${refOffset - 16}px)`);
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
  }, 900000);

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
    let metaColor = 'rgb(0, 141, 205)';

    if (weatherMain) {
      let className: 'primary' | 'secondary' | 'tertiary' = 'primary';

      switch (true) {
        case /clouds|drizzle|rainy?|snow/i.test(
          weatherMain as WeatherResponseMain
        ):
          className = 'primary';
          break;
        case /clear/i.test(weatherMain as WeatherResponseMain):
          className = 'secondary';
          metaColor = 'rgb(154, 138, 0)';
          break;
        default:
          className = 'tertiary';
          metaColor = 'rgb(128, 128, 128)';
      }

      Body.className = Body.className.replace(
        /(theme--).*(--0)/,
        `$1${className}$2`
      );
    }

    if (nightMode !== undefined) {
      Body.classList[nightMode ? 'add' : 'remove']('night-time');
    }

    MetaTheme.content = state.nightMode ? 'rgb(0, 85, 149)' : metaColor;
  });
};

export const updateTabLink = (
  activeTabLinkIndex: number,
  textContent?: string
) => {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;
  const TabIndicator = TabLinks[0].previousElementSibling as HTMLSpanElement;

  TabLinks?.forEach((TabLink, i) => {
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
