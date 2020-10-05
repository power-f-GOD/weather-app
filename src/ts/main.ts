import { QAll, state } from './utils';
import { updateCard } from './card';

export default function main() {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;

  if (TabLinks.length) {
    TabLinks.forEach((TabLink, index) =>
      TabLink.addEventListener('click', (e) => {
        handleTabLinkClick(index)(e);
        updateCard({ ...state[TabLink.id], type: 'A' });
      })
    );
  }
}

export const handleTabLinkClick = (tabLinkIndex: number) => (e: any) => {
  e.preventDefault();
  updateTabLink(state.other?.date_string as string, tabLinkIndex);
};

export const updateTabLink = (
  textContent: string,
  activeTabLinkIndex: number
) => {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;

  TabLinks.forEach((TabLink, i) => {
    if (activeTabLinkIndex < TabLinks.length) {
      if (activeTabLinkIndex === i) {
        TabLink.classList.add('active');

        if (activeTabLinkIndex === 2) {
          TabLink.textContent = textContent;
        }
      } else {
        TabLink.classList.remove('active');
      }
    }
  });
};
