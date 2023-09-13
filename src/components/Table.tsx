import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { formatString as i18n, useSettings } from '../helpers';
import { inProgress as inProgressCss, table } from '../styles';
import { Meeting, State } from '../types';
import Button from './Button';
import { icons } from './Icon';
import Link from './Link';

export default function Table({
  state,
  setState,
  filteredSlugs = [],
  inProgress = [],
}: {
  state: State;
  setState: (state: State) => void;
  filteredSlugs: string[];
  inProgress: string[];
}) {
  const { settings, strings } = useSettings();
  const meetingsPerPage = 10;
  const supported_columns = [
    'address',
    'distance',
    'location',
    'location_group',
    'name',
    'region',
    'time',
  ];
  const [limit, setLimit] = useState(meetingsPerPage);
  const [showInProgress, setShowInProgress] = useState(false);
  const { distance, location, region } = state.capabilities;

  //show columns based on capabilities
  const columns = settings.columns
    .filter(col => supported_columns.includes(col))
    .filter(col => region || col !== 'region')
    .filter(col => distance || col !== 'distance')
    .filter(col => location || !['location', 'location_group'].includes(col));

  const getValue = (meeting: Meeting, key: string) => {
    if (key === 'address') {
      const buttons: {
        className: string;
        icon: keyof typeof icons;
        text?: string;
      }[] = [];
      if (meeting.isInPerson) {
        buttons.push({
          className: 'in-person',
          icon: 'geo',
          text: meeting.address,
        });
      }
      if (meeting.conference_provider) {
        buttons.push({
          className: 'online',
          icon: 'camera',
          text: meeting.conference_provider,
        });
      }
      if (meeting.conference_phone) {
        buttons.push({
          className: 'online',
          icon: 'phone',
          text: strings.phone,
        });
      }
      if (!meeting.isInPerson && !meeting.isOnline) {
        buttons.push({
          className: 'inactive',
          icon: 'close',
          text: strings.types.inactive,
        });
      }
      return (
        <div>
          {buttons.map((button, index) => (
            <Button key={index} small={true} {...button} />
          ))}
        </div>
      );
    } else if (key === 'distance' && meeting.distance) {
      return (
        <div>
          <span>{meeting.distance.toLocaleString(navigator.language)}</span>
          <small>{strings[settings.distance_unit]}</small>
        </div>
      );
    } else if (key === 'location') {
      return meeting.location;
    } else if (key === 'location_group') {
      return meeting.isInPerson ? meeting.location : meeting.group;
    } else if (key === 'name' && meeting.slug) {
      return <Link meeting={meeting} state={state} setState={setState} />;
    } else if (key === 'region' && meeting.regions) {
      return meeting.regions[meeting.regions.length - 1];
    } else if (key === 'time') {
      return meeting.start ? (
        <time>
          <span>{meeting.start.toFormat('t')}</span>
          <span>{meeting.start.toFormat('cccc')}</span>
        </time>
      ) : (
        strings.appointment
      );
    }
    return null;
  };

  const Row = ({ slug }: { slug: keyof typeof state.meetings }) => {
    const meeting = state.meetings[slug];
    return (
      <tr
        onClick={() =>
          setState({
            ...state,
            input: {
              ...state.input,
              meeting: meeting.slug,
            },
          })
        }
      >
        {columns.map((column, index) => (
          <td key={index}>{getValue(meeting, column)}</td>
        ))}
      </tr>
    );
  };

  return !filteredSlugs.length ? null : (
    <table css={table}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>
              {strings[column as keyof Translation] as string}
            </th>
          ))}
        </tr>
      </thead>
      {!!inProgress.length && (
        <tbody css={inProgressCss}>
          {showInProgress ? (
            inProgress.map((slug, index) => <Row slug={slug} key={index} />)
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <button onClick={() => setShowInProgress(true)}>
                  {inProgress.length === 1
                    ? strings.in_progress_single
                    : i18n(strings.in_progress_multiple, {
                        count: inProgress.length,
                      })}
                </button>
              </td>
            </tr>
          )}
        </tbody>
      )}
      <InfiniteScroll
        element="tbody"
        hasMore={filteredSlugs.length > limit}
        loadMore={() => setLimit(limit + meetingsPerPage)}
      >
        {filteredSlugs.slice(0, limit).map((slug, index) => (
          <Row slug={slug} key={index} />
        ))}
      </InfiniteScroll>
    </table>
  );
}
