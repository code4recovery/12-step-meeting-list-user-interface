import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Dropdown from '../../src/components/Dropdown';
import { SettingsContext, mergeSettings } from '../../src/helpers';
import { mockState } from '../__fixtures__';
import { State } from '../../src/types';

describe('<Dropdown />', () => {
  const filter = 'type';
  const settings = mergeSettings();
  const defaultValue = settings.strings[`${filter}_any`];
  const mockStateWithFilter: State = {
    ...mockState,
    input: {
      ...mockState.input,
      [filter]: [],
    },
    indexes: {
      ...mockState.indexes,
      [filter]: [
        { key: 'foo', name: 'Foo', slugs: [] },
        {
          key: 'bar',
          name: 'Bar',
          slugs: [],
          children: [{ key: 'baz', name: 'Baz', slugs: [] }],
        },
        { key: 'online', name: 'Online', slugs: [] },
        { key: 'in-person', name: 'In-Person', slugs: [] },
      ],
    },
  };

  it('renders', () => {
    render(
      <SettingsContext.Provider value={settings}>
        <Dropdown
          filter={filter}
          open={false}
          end={false}
          defaultValue={defaultValue}
          setDropdown={jest.fn()}
          state={{
            ...mockStateWithFilter,
            input: { ...mockStateWithFilter.input, [filter]: ['bar'] },
          }}
          setState={jest.fn()}
        />
      </SettingsContext.Provider>
    );
    expect(screen.getAllByText(defaultValue)).toHaveLength(1);
  });

  it('opens', () => {
    const mockSetDropdown = jest.fn();

    render(
      <SettingsContext.Provider value={settings}>
        <Dropdown
          filter={filter}
          open={false}
          end={false}
          defaultValue={defaultValue}
          setDropdown={mockSetDropdown}
          state={mockState}
          setState={jest.fn()}
        />
      </SettingsContext.Provider>
    );

    const button = screen.getAllByRole('button');
    fireEvent.click(button[0]);
    expect(mockSetDropdown).toBeCalled();

    const dropdown = screen.getByLabelText(defaultValue);
    expect(dropdown).not.toBeVisible();
  });

  it('has working links', async () => {
    const mockSetDropdown = jest.fn();
    const mockSetState = jest.fn();

    render(
      <SettingsContext.Provider value={settings}>
        <Dropdown
          defaultValue={defaultValue}
          end={false}
          filter={filter}
          open={true}
          setDropdown={mockSetDropdown}
          setState={mockSetState}
          state={mockStateWithFilter}
        />
      </SettingsContext.Provider>
    );

    function modify<
      K extends keyof (typeof mockStateWithFilter)['input'],
      T extends (typeof mockStateWithFilter)['input'][K]
    >(key: K, value: T) {
      return {
        ...mockStateWithFilter,
        input: { ...mockStateWithFilter.input, [key]: value },
      };
    }

    //dropdown starts open
    const dropdown = screen.getByLabelText(defaultValue);
    expect(dropdown).toBeVisible();

    const button = screen.getAllByRole('button');
    fireEvent.click(button[0]);
    expect(mockSetDropdown).toBeCalled();

    //test links
    const link1 = screen.getByText('Foo');
    const link2 = screen.getByText('Bar');

    //click a filter
    fireEvent.click(link1);
    expect(mockSetState).toHaveBeenLastCalledWith(modify(filter, ['foo']));

    //add a filter by clicking with metaKey
    fireEvent.click(link2, { metaKey: true });
    expect(mockSetState).toHaveBeenLastCalledWith(
      modify(filter, ['foo', 'bar'])
    );

    //remove a filter by clicking with metaKey
    fireEvent.click(link1, { metaKey: true });
    expect(mockSetState).toHaveBeenLastCalledWith(modify(filter, ['bar']));

    //click all
    const all = screen.getAllByText(settings.strings[`${filter}_any`]);
    fireEvent.click(all[1]);
    expect(mockSetState).toHaveBeenLastCalledWith(modify(filter, []));
  });
});
