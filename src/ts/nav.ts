import { Q, getData, render, addEventListenerOnce } from './utils';
import { CitiesResponse } from './types';



export default function nav() {
  // const Nav = Q('nav');
  const SearchButton = Q('.search-button') as HTMLElement;
  const SearchInput = Q('.search-input') as HTMLInputElement;
  const SearchResultsWrapper = Q('.search-results-overlay') as
    | HTMLElement
    | any;
  const SearchResultsContainer = Q(
    '.search-results-overlay .container'
  ) as HTMLElement;
  const View = Q('.View') as HTMLElement | any;

  let inputTimeout: any | undefined;

  const searchMessage = (message: string) => {
    render(
      `<span class='search-result text-center'>${message}<span />`,
      SearchResultsContainer
    );
  };

  const callTransitionEndListener = () => {
    addEventListenerOnce(SearchResultsWrapper, handleTransitionEnd);
  };

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

  const handleSearch = (e: any) => {
    clearTimeout(inputTimeout);

    if (/Tab|Arrow|Shift|Meta|Control|Alt/i.test(e.key)) {
      return;
    }

    if (SearchInput.value.trim()) {
      SearchResultsWrapper.classList.add('show');
      searchMessage('Getting ready...');
      inputTimeout = setTimeout(() => {
        searchMessage('Getting matching cities...');
        getData(
          'https://geocode.xyz/',
          `scantext=${SearchInput.value}&geoit=json`
        )
          .then((data: CitiesResponse) => {
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
              searchMessage(
                `${
                  error
                    ? 'Something went wrong. Please try again after some time.'
                    : `Sorry, could not find any matching cities for '${SearchInput.value.replace(
                        /<\/?script>/,
                        ''
                      )}'. Try typing full city keyword.`
                }`
              );
            }
            console.log(data, SearchInput.value as any);
          })
          .catch(() => {
            searchMessage('An error occurred. Failed to get.');
          });
      }, 2000);
    } else {
      SearchResultsWrapper.classList.remove('show');
    }

    callTransitionEndListener();
  };

  SearchButton.onclick = handleSearch;
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
