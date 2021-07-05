import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames/bind';

import Dropdown from './Dropdown';
import Icon from './Icon';
import { formatUrl, settings, strings } from '../helpers';

export default function Controls({ state, setState }) {
  const [dropdown, setDropdown] = useState(null);
  const [search, setSearch] = useState(state.input.search);

  const searchInput = useRef();

  useEffect(() => {
    //add click listener for dropdowns (in lieu of including bootstrap js + jquery)
    document.body.addEventListener('click', closeDropdown);
    return () => {
      //remove click listener for dropdowns (in lieu of including bootstrap js + jquery)
      document.body.removeEventListener('click', closeDropdown);
    };
  }, [document]);

  //close current dropdown (on body click)
  const closeDropdown = e => {
    if (e.srcElement.classList.contains('dropdown-toggle')) return;
    setDropdown(null);
  };

  //search modes
  const modes = ['search'];
  if (state.capabilities.coordinates) modes.push('location');
  if (state.capabilities.geolocation) modes.push('me');

  //keyword search
  const keywordSearch = e => {
    setSearch(e.target.value);
    if (state.input.mode === 'search') {
      setState({
        ...state,
        input: {
          ...state.input,
          search: e.target.value,
        },
      });
    }
  };

  //near location search
  const locationSearch = e => {
    e.preventDefault();

    if (state.input.mode === 'location') {
      setState({
        ...state,
        input: {
          ...state.input,
          latitude: null,
          longitude: null,
          search: search,
        },
      });
    }
  };

  //set search mode dropdown and clear all distances
  const setMode = (e, mode) => {
    e.preventDefault();

    Object.keys(state.meetings).forEach(slug => {
      state.meetings[slug].distance = null;
    });

    //clear search
    setSearch('');

    //focus after waiting for disabled to clear
    setTimeout(() => searchInput.current.focus(), 100);

    setState({
      ...state,
      capabilities: {
        ...state.capabilities,
        distance: false,
      },
      indexes: {
        ...state.indexes,
        distance: [],
      },
      input: {
        ...state.input,
        search: '',
        mode: mode,
        latitude: null,
        longitude: null,
      },
    });
  };

  //toggle list/map view
  const setView = (e, view) => {
    e.preventDefault();
    setState({ ...state, input: { ...state.input, view: view } });
  };

  //decide whether to show filter
  const canShowFilter = filter => {
    if (!state.capabilities[filter]) return false;
    if (filter === 'region' && state.input.mode === 'me') return false;
    if (filter === 'distance' && state.input.mode === 'search') return false;
    return true;
  };

  return (
    !!Object.keys(state.meetings).length && (
      <div className="row d-print-none controls">
        <div className="col-sm-6 col-lg mb-3">
          <div className="position-relative">
            <form className="input-group" onSubmit={locationSearch}>
              <input
                className="form-control"
                disabled={state.input.mode === 'me'}
                onChange={keywordSearch}
                placeholder={strings.modes[state.input.mode]}
                ref={searchInput}
                spellCheck="false"
                type="search"
                value={search}
              />
              {modes.length > 1 && (
                <button
                  aria-label={strings.modes[state.input.mode]}
                  className="btn btn-outline-secondary dropdown-toggle"
                  onClick={() =>
                    setDropdown(dropdown === 'search' ? null : 'search')
                  }
                  type="button"
                />
              )}
            </form>
            {modes.length > 1 && (
              <div
                className={cx('dropdown-menu dropdown-menu-end my-1', {
                  show: dropdown === 'search',
                })}
              >
                {modes.map(mode => (
                  <a
                    className={cx(
                      'align-items-center dropdown-item d-flex justify-content-between',
                      {
                        'active bg-secondary text-white':
                          state.input.mode === mode,
                      }
                    )}
                    href={formatUrl({ ...state.input, mode: mode })}
                    key={mode}
                    onClick={e => setMode(e, mode)}
                  >
                    {strings.modes[mode]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        {settings.filters.map(
          filter =>
            canShowFilter(filter) && (
              <div className="col-sm-6 col-lg mb-3" key={filter}>
                <Dropdown
                  defaultValue={strings[filter + '_any']}
                  filter={filter}
                  open={dropdown === filter}
                  options={state.indexes[filter]}
                  right={filter === 'type' && !state.capabilities.map}
                  setDropdown={setDropdown}
                  state={state}
                  setState={setState}
                  values={state.input[filter]}
                />
              </div>
            )
        )}
        <div className="col-sm-6 col-lg mb-3">
          <div
            aria-label="Layout options"
            className="btn-group h-100  w-100"
            role="group"
          >
            {['table', 'grid', 'map']
              .filter(view => view !== 'map' || state.capabilities.map)
              .map(view => (
                <button
                  className={cx(
                    'btn btn-outline-secondary d-flex align-items-center justify-content-center w-100',
                    {
                      active: state.input.view === view,
                    }
                  )}
                  key={view}
                  onClick={e => setView(e, view)}
                  type="button"
                >
                  <Icon icon={view} />
                </button>
              ))}
          </div>
        </div>
      </div>
    )
  );
}
