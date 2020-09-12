import { QAll } from './utils';

export default function main() {
  const TabLinks = QAll('.Main .tab-link');

  const handleLinkClick = (e: any) => {
    e.preventDefault();
    console.log('should prevent...');
    TabLinks.forEach((TabLink) => {
      if (TabLink === e.target) {
        TabLink.classList.add('active');
      } else {
        TabLink.classList.remove('active');
      }
    });
  };
  
  if (TabLinks.length) {
    TabLinks.forEach((TabLink) =>
      TabLink.addEventListener('click', handleLinkClick)
    );
  }
}
