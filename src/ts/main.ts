import { QAll, state, transform } from './utils';
import { updateCard } from './card';

export default function main() {
  const TabLinks = QAll('.Main .tab-link') as NodeListOf<HTMLAnchorElement>;

  if (TabLinks.length) {
    TabLinks.forEach((TabLink, index) =>
      TabLink.addEventListener('click', (e) => {
        e.preventDefault();
        updateTabLink(index, state.other?.date_string as string);
        updateCard({ ...state[TabLink.id], type: 'A' });
      })
    );
  }
}

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

        const { offsetWidth, offsetLeft } = TabLink;

        TabLink.classList.add('active');
        transform(TabIndicator, `translateX(${offsetLeft}px)`);
        TabIndicator.style.width = `${offsetWidth}px`;
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
