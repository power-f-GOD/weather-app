import { State, WeatherInfoProps } from './types';
import { updateLocation } from './comp.nav';
import { updateTabLink, updateBody } from './comp.main';
import { updateCard } from './comp.card';

const state: Readonly<Pick<State, 'setState'>> & Omit<State, 'setState'> = {
  hash: '#40.69,-73.96',
  latitude: 40.69,
  longitude: -73.96,
  location: { text: 'New York, US', err: false },
  setState(val: Omit<State, 'setState'>) {
    return new Promise((resolve) => {
      //update state
      for (const [key, value] of Object.entries(val)) {
        (state as any)[key] =
          Array.isArray(value) || /string|number/.test(typeof value)
            ? value
            : { ...(state as any)[key], ...value };
      }

      const {
        location: _location,
        current,
        daily,
        tomorrow,
        other,
        hourly,
        activeTabLinkIndex
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
      if (_location) {
        updateLocation(_location.text ?? state.location?.text, _location.err);
      }

      if (activeTabLinkIndex !== undefined) {
        updateTabLink(activeTabLinkIndex, (other ?? state.other)?.date_string);
      }

      if (current || tomorrow || other) {
        updateCard({ ...activeTab, type: 'A' });
      }

      if (current || tomorrow || other || activeTabLinkIndex !== undefined) {
        updateBody(
          activeTab?.weather?.slice(-1)[0].main ?? activeTab?.main ?? 'clouds'
        );
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
