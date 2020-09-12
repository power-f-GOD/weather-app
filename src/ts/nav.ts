import { Q, QAll, getData, render, addEventListenerOnce } from './utils';

export interface CitiesResponse {
  latt: string;
  longt: string;
  match: { latt: string; longt: string; matchtype: string; location: string }[];
  matches: string;
  error: any;
  success: boolean;
}

export default function nav() {
  // const Nav = Q('nav');
  const SearchInput = Q('.search-input') as HTMLElement;
  const SearchResultsWrapper = Q('.search-results-overlay') as
    | HTMLElement
    | any;
  const SearchResultsContainer = Q(
    '.search-results-overlay .container'
  ) as HTMLElement;
  const NavLinks = QAll('.Nav .nav-link') as NodeListOf<HTMLElement>;
  const View = Q('.View') as HTMLElement | any;

  let inputTimeout: any | undefined;

  const handleTransitionEnd = () => {
    const isHidden = !SearchResultsWrapper.classList.contains('show');

    if (isHidden) {
      View.inert = false;
      SearchResultsWrapper.inert = true;
      render('', SearchResultsContainer);
    } else {
      View.inert = true;
      SearchResultsWrapper.inert = false;
    }
  };

  const callTransitionEndListener = () => {
    addEventListenerOnce(SearchResultsWrapper, handleTransitionEnd);
  };

  const handleLinkClick = (e: any) => {
    e.preventDefault();
    console.log(e.target.textContent, ' clicked!');
  };

  const handleSearch = (e: any) => {
    clearTimeout(inputTimeout);
    
    if (/Tab|Arrow|Shift|Meta|Control|Alt/i.test(e.key)) {
      return;
    }

    if (e.target.value.trim()) {
      SearchResultsWrapper.classList.add('show');
      render(
        `<span class='search-result text-center'>Getting ready...<span />`,
        SearchResultsContainer
      );
      inputTimeout = setTimeout(() => {
        render(
          `<span class='search-result text-center'>Getting matching cities...<span />`,
          SearchResultsContainer
        );
        getData(
          'https://geocode.xyz/',
          `scantext=${e.target.value}&geoit=json`
        ).then((data: CitiesResponse) => {
          const { match, matches, error } = data;

          if (matches) {
            render(
              match.map(({ latt, longt, location, matchtype }) =>
                SearchResult({
                  longitude: Number(longt),
                  latitude: Number(latt),
                  location,
                  type: matchtype
                })
              ),
              SearchResultsContainer
            );
          } else {
            render(
              `<span class='search-result text-center'>${
                error
                  ? 'Something went wrong. Please try again after some time.'
                  : `Sorry, could not find any matching cities for '${e.target.value.replace(
                      /<\/?script>/,
                      ''
                    )}'. Try typing full city keyword.`
              }<span/>`,
              SearchResultsContainer
            );
          }
          console.log(data, e.target.value as any);
        });
      }, 2000);
    } else {
      SearchResultsWrapper.classList.remove('show');
    }

    callTransitionEndListener();
  };

  SearchInput.onkeyup = handleSearch;
  SearchInput.onfocus = (e: any) => {
    if (e.target.value.trim()) {
      SearchResultsWrapper.classList.add('show');
      callTransitionEndListener();
    }
  };
  SearchResultsWrapper.setAttribute('inert', true);
  SearchResultsWrapper.onclick = (e: any) => {
    if (/-overlay/.test(e.target.className)) {
      SearchResultsWrapper.classList.remove('show');
      callTransitionEndListener();
    }
  };

  if (NavLinks.length) {
    NavLinks.forEach((NavLink) =>
      NavLink.addEventListener('click', handleLinkClick)
    );
  }

  (Q('.search-form') as HTMLElement).onsubmit = (e: any) => {
    e.preventDefault();
  };
}

export const SearchResult = (props: {
  longitude: number;
  latitude: number;
  location: string;
  type: string;
}) => {
  let { longitude, latitude, location, type } = props;

  location = location
    .split(',')
    .map((word) => word.trim())
    .join(', ');

  return `
  <a href="#!" 
    class="search-result fulfilled"
    data-longitute='${longitude}' 
    data-latitude='${latitude}'
    data-location='${location}'>
    <p class="location">${location}</p>
    <p class="type">${type}</p>
  </a>`;
};
