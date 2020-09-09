import { QAll } from './utils';

export default function nav() {
  // const Nav = Q('nav');
  const NavLinks = QAll('nav .nav-link');

  const handleLinkClick = (e: any) => {
    e.preventDefault();
    console.log(e.target.textContent, ' clicked!');
  };

  if (NavLinks.length) {
    NavLinks.forEach((NavLink) =>
      NavLink.addEventListener('click', handleLinkClick)
    );
  }
}
