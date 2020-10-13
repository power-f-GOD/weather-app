import { Q, makeInert } from './utils';

export const footer = () => {
  const Container = Q('.Footer .container') as HTMLElement;
  const SideBar = Q('.side-bar') as HTMLElement;
  const SideBarToggler = Q('.side-bar-toggler') as HTMLElement;

  makeInert(Container, true, true);

  SideBarToggler.addEventListener('click', () => {
    SideBarToggler.classList.toggle('is-open');

    const isOpen = SideBarToggler.classList.contains('is-open');

    SideBar.classList[isOpen ? 'add' : 'remove']('open');
    Container.classList[isOpen ? 'add' : 'remove']('show');
    makeInert(Container, !isOpen, true);
  });

  Container.addEventListener('click', (e) => {
    if (e.target === Container) {
      SideBarToggler.click();
    }
  });
};
