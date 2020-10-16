import { State, WeatherInfoProps } from './types';
import { updateLocation } from './comp.nav';
import { updateTabLink, updateBody } from './comp.main';
import { updateCard } from './comp.card';
import { updateLastSynced } from './comp.footer';

const state: Readonly<Pick<State, 'setState'>> & Omit<State, 'setState'> = {
  latitude: 40.69,
  longitude: -73.96,
  location: { name: 'New York, US', err: false },
  nightMode: undefined,
  setState(val: Omit<State, 'setState'>) {
    return new Promise((resolve) => {
      //update state
      for (const [key, value] of Object.entries(val)) {
        (state as any)[key] =
          Array.isArray(value) || /string|number|boolean/.test(typeof value)
            ? value
            : { ...(state as any)[key], ...value };
      }

      const {
        location,
        current,
        daily,
        tomorrow,
        other,
        hourly,
        nightMode,
        activeTabLinkIndex,
        lastSynced
      } = val; //using props from val (if they exist) and not state in order for to not make redundant (UI) updates
      let activeTab = current || state.current;

      switch (activeTabLinkIndex || state.activeTabLinkIndex) {
        case 1:
          activeTab = tomorrow || state.tomorrow;
          break;
        case 2:
          activeTab = other || state.other;
          break;
        default:
          activeTab = current || state.current;
      }

      //update UI...
      if (location) {
        updateLocation(
          location.statusText ?? location.name ?? state.location?.name ?? '...',
          location.err
        );
      }

      if (activeTabLinkIndex !== undefined) {
        updateTabLink(activeTabLinkIndex, (other ?? state.other)?.date_string);
      }

      if (current || tomorrow || other) {
        updateCard({ ...activeTab, type: 'A' });
      }

      if (
        current ||
        tomorrow ||
        other ||
        activeTabLinkIndex !== undefined ||
        nightMode !== undefined
      ) {
        updateBody({
          nightMode,
          weatherMain:
            activeTab?.weather?.slice(-1)[0].main ?? activeTab?.main ?? 'Clouds'
        });
      }

      if (daily) {
        daily.map((data: WeatherInfoProps, index: number) => {
          updateCard({
            ...data,
            index,
            type: 'B'
          });
        });
      }

      if (hourly) {
        hourly.map((data: WeatherInfoProps, index: number) => {
          updateCard({
            ...data,
            index,
            type: 'C'
          });
        });
      }

      if (lastSynced) {
        updateLastSynced(lastSynced);
      }

      //do the next few lines so the setState function is not resolved with state
      const _state = { ...state } as any;

      delete _state.setState;

      if (navigator.cookieEnabled) {
        localStorage.weatherAppState = JSON.stringify(_state);
      }

      resolve(_state);
    });
  }
};

export const setState: State['setState'] = state.setState;

export default state;
