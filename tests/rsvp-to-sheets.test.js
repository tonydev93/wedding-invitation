const assert = require('node:assert/strict');
const test = require('node:test');

const {
  GOOGLE_SHEETS_ENDPOINT,
  buildRsvpPayload,
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
