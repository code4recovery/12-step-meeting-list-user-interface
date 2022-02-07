import * as momentTZ from 'moment-timezone';

momentTZ.tz.setDefault('America/New_York');

const savedLocation = window.location;
const savedHistory = window.history;

beforeEach(() => {
  delete window.location;
  delete window.history;

  window.history = {
    pushState: jest.fn(),
  };

  window.location = new URL('https://test.com');
});

afterEach(() => {
  window.location = savedLocation;
  window.history = savedHistory;
});
