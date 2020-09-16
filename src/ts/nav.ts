import {
  Q,
  getData,
  render,
  addEventListenerOnce,
  QAll,
  delay,
  task
} from './utils';
import { CitiesResponse } from './types';
import { getWeatherAndCityDataThenSetState } from './main';

export default function nav() {
  const CityLocation = Q('.Nav .location') as HTMLElement;
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

  const searchMessage = (message: string, err?: boolean) => {
    render(
      `<span class='search-result text-center ${
        err ? 'error' : ''
      }'>${message}<span />`,
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
      (SearchInput as any).onblur();
    } else {
      View.inert = true;
      SearchResultsWrapper.inert = false;
    }
  };

  let _task = () => {};
  let searchIsLoading = false;
  const handleSearchResultClick = (e: any) => {
    const Result = e.target as HTMLAnchorElement;
    const Type = Result.children[1] as HTMLElement;
    const { latitude, longitude, location, type } = Result.dataset ?? {};

    if (searchIsLoading) {
      Type.textContent = 'busy!🙂';
      delay(1000).then(() => {
        Type.textContent = type as string;
      });
      return;
    } else {
      Type.textContent = 'fetching data...🏃🏽‍♂️';
    }

    _task = () => {
      searchIsLoading = true;
      getWeatherAndCityDataThenSetState(
        Number(latitude),
        Number(longitude),
        location
      ).then(() => {
        searchIsLoading = false;
        Type.textContent = 'done!😎';
        delay(850).then(() => {
          SearchResultsWrapper.classList.remove('show');
          Type.textContent = type as string;
        });
        callTransitionEndListener();
      });
    };

    task.assign(_task).execute();
    // console.log(e.target.dataset);
  };

  const handleSearch = (e: any) => {
    if (/Tab|Arrow|Shift|Meta|Control|Alt/i.test(e?.key)) {
      return;
    }

    clearTimeout(inputTimeout);

    if (SearchInput.value.trim()) {
      SearchResultsWrapper.classList.add('show');
      searchMessage('Getting set...😊');
      inputTimeout = setTimeout(() => {
        searchMessage('Getting matching cities...😉');
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
              QAll('.search-result').forEach((result) => {
                result.addEventListener('click', handleSearchResultClick, true);
              });
            } else {
              searchMessage(
                `${
                  error
                    ? 'Something went wrong. Please try again after some time.😕'
                    : `Sorry, could not find any matching cities for '${SearchInput.value.replace(
                        /<\/?.>/,
                        ''
                      )}'. You may try typing full city keyword.`
                }`
              );
            }
            // console.log(data, SearchInput.value as any);
          })
          .catch(() => {
            searchMessage('An error occurred. Failed to get.', true);
          });
      }, 2000);
    } else {
      searchMessage("Ok, I'm waiting... 🙂");
    }

    callTransitionEndListener();
  };

  SearchInput.onkeyup = (e: any) => {
    CityLocation.classList.add('hide');
    handleSearch(e);
  };
  SearchInput.onfocus = (e: any) => {
    if (e.target.value.trim()) {
      SearchResultsWrapper.classList.add('show');
      callTransitionEndListener();
    }

    SearchInput.classList.add('focused');
    CityLocation.classList.add('hide');
  };
  SearchInput.onblur = () => {
    if (SearchResultsWrapper.classList.contains('show')) {
      return;
    }

    CityLocation.classList.remove('hide');
    setTimeout(() => {
      SearchInput.classList.remove('focused');
    }, 10);
  };

  SearchButton.onclick = () => {
    const hasFocus = SearchInput.classList.contains('focused');

    if (hasFocus) {
      if (SearchInput.value.trim()) {
        (SearchInput as any).onkeyup();
        SearchInput.focus();
      } else {
        SearchInput.blur();
      }
    } else {
      SearchInput.focus();
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

export const updateLocation = (text: string, err?: boolean) => {
  const CityLocation = Q('.Nav .location') as HTMLElement;

  CityLocation.classList[err ? 'add' : 'remove']('error');
  CityLocation.textContent = text;
};

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
    data-longitude='${longitude}' 
    data-latitude='${latitude}'
    data-location='${location}'
    data-type='${type}'>
    <p class="location">${location}</p>
    <p class="type">${type}</p>
  </a>`;
};
