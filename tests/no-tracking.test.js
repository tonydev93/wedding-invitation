const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const indexPath = path.join(__dirname, '..', 'index.html');

test('invitation page excludes analytics and fingerprinting code', () => {
  const html = fs.readFileSync(indexPath, 'utf8');

  [
    'assets/app.js',
    'assets/fingerprint.js',
    'window.getPixelExternalID',
    'window.TRACK_VIEW_CONTENT',
    'analytics.tiktok.com',
    'a.pancake.vn/js/app.js',
    'data-cf-beacon',
    'referrer_vars',
  ].forEach((trackingMarker) => {
    assert.doesNotMatch(html, new RegExp(trackingMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

test('invitation page retains its local visual assets and RSVP submission script', () => {
  const html = fs.readFileSync(indexPath, 'utf8');

  [
    'assets/animatev4.css',
    'assets/iconfont.css',
    'assets/site.css',
    'assets/rsvp-to-sheets.js',
    'assets/images/anh_cong.jpg',
    'background-music',
    'assets/embed.html',
  ].forEach((requiredAsset) => {
    assert.match(html, new RegExp(requiredAsset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

test('invitation page serves Pancake media from local files only', () => {
  const html = fs.readFileSync(indexPath, 'utf8');

  assert.doesNotMatch(html, /https:\/\/(?:content|statics)\.pancake\.vn\//);
  assert.match(html, /assets\/pancake\//);
  assert.doesNotMatch(html, /Content-Security-Policy[^>]*(?:content|statics)\.pancake\.vn/);
});
