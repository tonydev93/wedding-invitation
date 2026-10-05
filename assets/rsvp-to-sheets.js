(function (root) {
  const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwTzLwniP5lydRvh-3Olo7EEcC3caG-4hRfMpjeAOfOguO67-efQZt476cuO6i30TEiaA/exec';
  const BRIDE_GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw91BZnd144kcTcIhHnrYjxObriiQdqMEkYvkxk1JFGOHg3qrliI3GK2s3nebHmww2F/exec';
  const RSVP_SUCCESS_MESSAGE = 'Cảm ơn bạn đã xác nhận';

  function getRsvpEndpoint(search) {
    return new URLSearchParams(search || '').get('side') === 'bride'
      ? BRIDE_GOOGLE_SHEETS_ENDPOINT
      : GOOGLE_SHEETS_ENDPOINT;
  }

  function buildRsvpPayload(values) {
    return {
      full_name: values.full_name || '',
      relationship: values.text_input_1 || '',
      wish: values.text_input_2 || '',
      attendance: values.select_1 || '',
    };
  }

  function fieldValue(form, selector) {
    return form.querySelector(selector)?.value?.trim() || '';
  }

  function sendRsvpToGoogleSheets(form) {
    const payload = buildRsvpPayload({
      full_name: fieldValue(form, '#w-lju7zg47 input'),
      text_input_1: fieldValue(form, '#w-fuj2zvu7 input'),
      text_input_2: fieldValue(form, '#w-1h0nvpma input, #w-1h0nvpma textarea'),
      select_1: fieldValue(form, '#w-a1jhbdfs select'),
    });

    const search = root.location?.search || '';

    return fetch(getRsvpEndpoint(search), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((error) => console.error('Unable to save RSVP to Google Sheets.', error));
  }

  function closeRsvpPopup(form) {
    form.closest('#w-0sltrr7z')?.querySelector('#w-n773xftp')?.click();
  }

  function normalizeRsvpAlertMessage(message) {
    return message === 'Success' ? RSVP_SUCCESS_MESSAGE : message;
  }

  if (typeof document !== 'undefined') {
    if (typeof root.alert === 'function') {
      const nativeAlert = root.alert.bind(root);
      root.alert = (message) => nativeAlert(normalizeRsvpAlertMessage(message));
    }

    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.closest('#w-6ahmj60e')) return;
      sendRsvpToGoogleSheets(form);
      closeRsvpPopup(form);
    }, true);
  }

  const api = {
    GOOGLE_SHEETS_ENDPOINT,
    BRIDE_GOOGLE_SHEETS_ENDPOINT,
    RSVP_SUCCESS_MESSAGE,
    getRsvpEndpoint,
    normalizeRsvpAlertMessage,
    buildRsvpPayload,
    closeRsvpPopup,
  };
  if (typeof module !== 'undefined') module.exports = api;
  root.RsvpToSheets = api;
})(typeof window !== 'undefined' ? window : globalThis);
