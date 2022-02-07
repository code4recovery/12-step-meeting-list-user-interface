import moment from 'moment-timezone';

import { settings } from '../settings';
import { getIndexByKey } from './get-index-by-key';
import { calculateDistances } from './calculate-distances';

//run filters on meetings; this is run at every render
export function filterMeetingData(state, setState, mapbox) {
  const matchGroups = {};

  //filter by distance, region, time, type, and weekday
  settings.filters.forEach(filter => {
    if (state.input[filter]?.length && state.capabilities[filter]) {
      matchGroups[filter] = [].concat.apply(
        [],
        state.input[filter].map(key => {
          const match = getIndexByKey(state.indexes[filter], key);
          return match ? match.slugs : [];
        })
      );
    }
  });

  //handle keyword search or geolocation
  if (state.input.mode === 'search') {
    if (!!state.input.search) {
      const orTerms = processSearchTerms(state.input.search);
      const matches = Object.keys(state.meetings).filter(slug =>
        orTerms.some(andTerm =>
          andTerm.every(term => state.meetings[slug].search.search(term) !== -1)
        )
      );
      matchGroups.search = [].concat.apply([], matches);
    }
  } else if (['me', 'location'].includes(state.input.mode)) {
    //only show meetings with physical locations
    const meetingsWithCoordinates = Object.keys(state.meetings).filter(
      slug => state.meetings[slug].latitude && state.meetings[slug].latitude
    );
    matchGroups.coordinates = meetingsWithCoordinates;

    if (!state.input.latitude || !state.input.longitude) {
      if (state.input.search && state.input.mode === 'location') {
        //make mapbox API request https://docs.mapbox.com/api/search/
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${
            state.input.search
          }.json?${new URLSearchParams({
            access_token: mapbox,
            autocomplete: false,
            language: settings.language,
          })}`
        )
          .then(result => result.json())
          .then(result => {
            if (result.features && result.features.length) {
              //re-render page with new params
              calculateDistances(
                result.features[0].center[1],
                result.features[0].center[0],
                filteredSlugs,
                state,
                setState
              );
            } else {
              //show error
            }
          });
      } else if (state.input.mode === 'me') {
        navigator.geolocation.getCurrentPosition(
          position => {
            calculateDistances(
              position.coords.latitude,
              position.coords.longitude,
              filteredSlugs,
              state,
              setState
            );
          },
          error => {
            console.warn('getCurrentPosition() error', error);
          },
          { timeout: 5000 }
        );
      }
    }
  }

  //do the filtering, if necessary
  const filteredSlugs = Object.keys(matchGroups).length
    ? getCommonElements(Object.values(matchGroups)) //get intersection of slug arrays
    : Object.keys(state.meetings); //get everything

  //custom sort function
  const sortMeetings = (a, b) => {
    const meetingA = state.meetings[a];
    const meetingB = state.meetings[b];

    //sort appointment meetings to the end
    if (meetingA.time && !meetingB.time) return -1;
    if (!meetingA.time && meetingB.time) return 1;

    if (!state.input.weekday.length) {
      //if upcoming, sort by time_diff
      if (meetingA.minutes_now !== meetingB.minutes_now) {
        return meetingA.minutes_now - meetingB.minutes_now;
      }
    } else {
      if (meetingA.minutes_week !== meetingB.minutes_week) {
        return meetingA.minutes_week - meetingB.minutes_week;
      }
    }

    //then by distance
    if (meetingA.distance !== meetingB.distance) {
      if (meetingA.distance === null) return -1;
      if (meetingB.distance === null) return 1;
      return meetingA.distance - meetingB.distance;
    }

    //then by location name
    if (meetingA.location !== meetingB.location) {
      if (!meetingA.location) return -1;
      if (!meetingB.location) return 1;
      return meetingA.location.localeCompare(meetingB.location);
    }

    //then by meeting name
    if (meetingA.name !== meetingB.name) {
      if (!meetingA.name) return -1;
      if (!meetingB.name) return 1;
      return meetingA.name.localeCompare(meetingB.location);
    }

    return 0;
  };

  //sort slugs
  filteredSlugs.sort(sortMeetings);

  //find in-progress meetings
  const now = moment();
  const inProgress = filteredSlugs
    .filter(
      slug =>
        state.meetings[slug].start?.diff(now, 'minutes') <
          settings.now_offset &&
        state.meetings[slug].end?.isAfter() &&
        !state.meetings[slug].types.includes('inactive')
    )
    .sort(sortMeetings);

  return [filteredSlugs, inProgress];
}

//get common matches between arrays (for meeting filtering)
function getCommonElements(arrays) {
  return arrays.shift().filter(v => arrays.every(a => a.indexOf(v) !== -1));
}

//converts search input string into nested arrays of search terms
//"term1 OR term2 term3" => ['term1', ['term2', 'term3']]
function processSearchTerms(input) {
  return input
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll(' OR ', '|')
    .toLowerCase()
    .split('|')
    .map(phrase => phrase.split('"'))
    .map(phrase => [
      ...new Set(
        phrase
          .filter((_e, index) => index % 2)
          .concat(
            phrase
              .filter((_e, index) => !(index % 2))
              .join(' ')
              .split(' ')
          )
          .filter(e => e)
      ),
    ])
    .filter(e => e.length);
}
