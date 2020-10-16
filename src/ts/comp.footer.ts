import { Q, makeInert, requireDateChunk } from './utils';
import state, { setState } from './state';

export const footer = () => {
  const Nav = Q('.Nav') as HTMLElement;
  const Main = Q('.Main') as HTMLElement;
  const Container = Q('.Footer .container') as HTMLElement;
  const SideBar = Q('.side-bar') as HTMLElement;
  const SideBarToggler = Q('.side-bar-toggler') as HTMLElement;
  const ThemeToggler = Q('.theme-toggler') as HTMLElement;

  makeInert(Container, true);

  SideBarToggler.addEventListener('click', () => {
    SideBarToggler.classList.toggle('is-open');

    const isOpen = SideBarToggler.classList.contains('is-open');

    SideBar.classList[isOpen ? 'add' : 'remove']('open');
    Container.classList[isOpen ? 'add' : 'remove']('show');
    makeInert(Container, !isOpen);
    makeInert(Nav, isOpen);
    makeInert(Main, isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  });

  SideBar.addEventListener('click', ({ target }: Event) => {
    if (/A/i.test((target as Element).tagName)) {
      SideBarToggler.click();
    }
  });

  Container.addEventListener('click', ({ target }: Event) => {
    if (target === Container) {
      SideBarToggler.click();
    }
  });

  ThemeToggler.addEventListener('click', () => {
    setState({
      nightMode: state.nightMode !== undefined ? !state.nightMode : true
    });
  });
};

export function updateLastSynced(lastSynced: number) {
  const LastSyncedDate = Q('.last-synced-date') as HTMLElement;

  const { date_string, hour, day, date_is_today } = requireDateChunk(
    lastSynced
  );

  LastSyncedDate.textContent = `${
    date_is_today ? 'today' : `${day}, ${date_string}`
  } at ${hour}`;
}
