const assert = require('node:assert/strict');
const test = require('node:test');

const {
  GOOGLE_SHEETS_ENDPOINT,
  BRIDE_GOOGLE_SHEETS_ENDPOINT,
  RSVP_SUCCESS_MESSAGE,
  buildRsvpPayload,
  getRsvpEndpoint,
  normalizeRsvpAlertMessage,
  closeRsvpPopup,
} = require('../assets/rsvp-to-sheets.js');

test('buildRsvpPayload maps RSVP form values to the spreadsheet columns', () => {
  assert.deepEqual(
    buildRsvpPayload({
      full_name: 'Nguyễn An',
      text_input_1: 'Bạn đại học',
      text_input_2: 'Trăm năm hạnh phúc',
      select_1: 'Có Thể Tham Dự',
    }),
    {
      full_name: 'Nguyễn An',
      relationship: 'Bạn đại học',
      wish: 'Trăm năm hạnh phúc',
      attendance: 'Có Thể Tham Dự',
    },
  );
});

test('uses the deployed Google Apps Script endpoint', () => {
  assert.equal(
    GOOGLE_SHEETS_ENDPOINT,
    'https://script.google.com/macros/s/AKfycbwTzLwniP5lydRvh-3Olo7EEcC3caG-4hRfMpjeAOfOguO67-efQZt476cuO6i30TEiaA/exec',
  );
});

test('routes bride invitations to the bride spreadsheet endpoint', () => {
  assert.equal(
    BRIDE_GOOGLE_SHEETS_ENDPOINT,
    'https://script.google.com/macros/s/AKfycbw91BZnd144kcTcIhHnrYjxObriiQdqMEkYvkxk1JFGOHg3qrliI3GK2s3nebHmww2F/exec',
  );
  assert.equal(getRsvpEndpoint('?side=bride'), BRIDE_GOOGLE_SHEETS_ENDPOINT);
  assert.equal(getRsvpEndpoint(''), GOOGLE_SHEETS_ENDPOINT);
  assert.equal(getRsvpEndpoint('?side=unknown'), GOOGLE_SHEETS_ENDPOINT);
});

test('uses the requested RSVP success message', () => {
  assert.equal(RSVP_SUCCESS_MESSAGE, 'Cảm ơn bạn đã xác nhận');
});

test('replaces only the native Success alert message', () => {
  assert.equal(normalizeRsvpAlertMessage('Success'), RSVP_SUCCESS_MESSAGE);
  assert.equal(normalizeRsvpAlertMessage('Validation failed'), 'Validation failed');
});

test('closeRsvpPopup clicks only the RSVP popup close control', () => {
  let closeClicks = 0;
  const closeControl = { click: () => { closeClicks += 1; } };
  const popup = {
    querySelector: (selector) => selector === '#w-n773xftp' ? closeControl : null,
  };
  const form = {
    closest: (selector) => selector === '#w-0sltrr7z' ? popup : null,
  };

  closeRsvpPopup(form);

  assert.equal(closeClicks, 1);
});
