const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

test('invitation selects bride variant from side query with groom fallback', () => {
  assert.match(html, /URLSearchParams\(window\.location\.search\)/);
  assert.match(html, /side/);
  assert.match(html, /bride/);
  assert.match(html, /groom/);
});

test('bride variant contains the requested ceremony and reception data', () => {
  [
    '12:30\\nChủ Nhật',
    '12 giờ 30',
    'LỄ VU QUY',
    'Sân Đình Vĩnh Ninh, Xã Đại Thanh, TP. Hà Nội',
    '09:00 - Chủ Nhật',
    '18.10.2026',
    '09 Tháng 09 Năm Bính Ngọ',
  ].forEach((value) => assert.ok(html.includes(value), `missing bride value: ${value}`));
});

test('bride variant uses its calendar date, map, directions link, and QR', () => {
  assert.match(html, /18\.10\.2026/);
  assert.match(html, /https:\/\/maps\.app\.goo\.gl\/Tbs8iNYcBeuCsGyn9/);
  assert.ok(html.includes('./assets/QR_co_dau.png'));
});

test('directions link overrides Webcake navigation and opens the selected map in a new tab', () => {
  assert.match(html, /directionsButton\.target\s*=\s*'_blank'/);
  assert.match(html, /event\.stopImmediatePropagation\(\)/);
  assert.match(html, /window\.open\(directionsUrl, '_blank', 'noopener,noreferrer'\)/);
  assert.doesNotMatch(html, /window\.location\.assign\(directionsUrl\)/);
});

test('bank details switch to the bride account for the bride variant', () => {
  assert.ok(html.includes('TPBank - Do Thi Kim Ly'));
  assert.ok(html.includes('02807857801'));
  assert.match(html, /bankInfo\.innerHTML\s*=\s*isBride\s*\?\s*'TPBank - Do Thi Kim Ly<br>02807857801'/);
});

test('album animations start before the image reaches the viewport center', () => {
  assert.match(html, /rootMargin:\s*'0px 0px 120px 0px'/);
});

test('bride variant puts the bride name before the groom name', () => {
  assert.match(html, /"w-4eszafr3":\s*"Kim Ly & Văn Bình/);
  assert.match(html, /"w-6uhy5p4v":\s*"THAM DỰ LỄ CƯỚI KIM LY & VĂN BÌNH/);
});

test('reorders family information and places reception before ceremony', () => {
  assert.match(html, /invitationSide\s*===\s*'bride'/);
  assert.match(html, /familyOrder/);
  assert.match(html, /receptionSection[\s\S]*insertBefore\(receptionSection, ceremonySection\)/);
});

test('bride invitation moves the bride family block above the groom family block', () => {
  assert.match(html, /brideFamilyPositions/);
  assert.match(html, /'w-o244vplo':\s*'137\.5px'/);
  assert.match(html, /'w-vrj5ae9z':\s*'465\.25390625px'/);
  assert.match(html, /'w-gp44a5y6':\s*'90\.00390625px'/);
  assert.match(html, /'w-n420q3gb':\s*'410\.0000305175781px'/);
});

test('background music attempts autoplay and keeps interaction fallback', () => {
  assert.match(html, /<audio id="background-music"[^>]*autoplay/);
  assert.match(html, /<audio id="background-music"[^>]*preload="auto"/);
  assert.match(html, /startOnce\(\);[\s\S]*document\.body\.addEventListener\("click", startOnce/);
});
