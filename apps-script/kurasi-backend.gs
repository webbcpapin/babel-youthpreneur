const SPREADSHEET_ID = '1PqRraw7Qt5nfpWECAemnTRH4edrKDZfti0gBImmgDbI';
const SHEET_NAME = 'Kurasi UMKM 2026';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const sheet = getSheet_();
    const submittedAt = new Date();
    const row = {
      submitted_at: submittedAt.toISOString(),
      ...payload,
    };

    appendObject_(sheet, row);

    return json_({
      ok: true,
      submitted_at: row.submitted_at,
    });
  } catch (error) {
    return json_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: 'Babel Youthpreneur Profiling dan Kurasi UMKM',
  });
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function appendObject_(sheet, rowObject) {
  const keys = Object.keys(rowObject);
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const existingHeaders = sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .filter(Boolean);

  const headers = existingHeaders.length ? existingHeaders : keys;
  const missingHeaders = keys.filter((key) => !headers.includes(key));
  const nextHeaders = headers.concat(missingHeaders);

  if (!existingHeaders.length || missingHeaders.length) {
    sheet.getRange(1, 1, 1, nextHeaders.length).setValues([nextHeaders]);
    sheet.setFrozenRows(1);
  }

  const row = nextHeaders.map((key) => {
    const value = rowObject[key];
    return Array.isArray(value) ? value.join(', ') : value || '';
  });

  sheet.appendRow(row);
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
