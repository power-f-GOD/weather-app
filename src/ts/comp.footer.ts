import { Q, makeInert } from './utils';

export const footer = () => {
  const Nav = Q('.Nav') as HTMLElement;
  const Main = Q('.Main') as HTMLElement;
  const Container = Q('.Footer .container') as HTMLElement;
  const SideBar = Q('.side-bar') as HTMLElement;
  const SideBarToggler = Q('.side-bar-toggler') as HTMLElement;

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

  Container.addEventListener('click', (e) => {
    if (e.target === Container) {
      SideBarToggler.click();
    }
  });
};
