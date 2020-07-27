import qs from 'query-string';
import merge from 'deepmerge';

import { settings } from './settings';

const separator = '/'; //used to separate multiple query string values (eg day=0/1)

export function getQueryString(queryString) {
  let input = {
    day: [],
    distance: [],
    district: [],
    meeting: null,
    mode: settings.defaults.mode,
    query: null,
    region: [],
    search: '',
    time: [],
    type: [],
    view: settings.defaults.view,
  };

  //load input from query string
  let querystring = qs.parse(location.search);
  for (let i = 0; i < settings.filters.length; i++) {
    let filter = settings.filters[i];
    if (querystring[filter]) {
      input[filter] = querystring[filter].split(separator);
    }
  }
  for (let i = 0; i < settings.params.length; i++) {
    if (querystring[settings.params[i]]) {
      input[settings.params[i]] = querystring[settings.params[i]];
    }
  }
  if (querystring.meeting) {
    input.meeting = querystring.meeting;
  }

  return input;
}

export function setQueryString(state) {
  let query = {};
  const existingQuery = qs.parse(location.search);

  //filter by region, day, time, and type
  settings.filters.forEach(filter => {
    if (state.input[filter].length && state.indexes[filter].length) {
      query[filter] = state.input[filter].join(separator);
    }
  });

  //keyword search
  if (state.input.search.length) {
    query['search'] = state.input.search;
  }

  //set mode property
  if (state.input.mode != settings.defaults.mode) {
    query.mode = state.input.mode;
  }

  //set map property if set
  if (state.input.view != settings.defaults.view) {
    query.view = state.input.view;
  }

  //set inside page property if set
  if (state.input.meeting) query.meeting = state.input.meeting;

  //create a query string with only values in use
  query = qs.stringify(
    merge(
      merge(existingQuery, {
        day: undefined,
        meeting: undefined,
        mode: undefined,
        region: undefined,
        search: undefined,
        time: undefined,
        type: undefined,
        view: undefined,
      }),
      query
    )
  );

  //un-url-encode the separator
  query = query.split(encodeURIComponent(separator)).join(separator);

  if (location.search.substr(1) != query) {
    //set the query string with html5
    window.history.pushState(
      '',
      '',
      query.length ? '?' + query : window.location.pathname
    );
  }
}
