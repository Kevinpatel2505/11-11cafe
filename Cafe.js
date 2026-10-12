function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.fbName || '',
    data.fbContact || '',
    data.fbRating || '',
    data.fbMessage || ''
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var reviews = [];
  // row 0 = headers: Timestamp, Naam, Contact, Rating, Message
  for (var i = 1; i < rows.length; i++) {
    reviews.push({
      name: rows[i][1],
      rating: rows[i][3],
      message: rows[i][4]
    });
  }
  return ContentService
    .createTextOutput(JSON.stringify({ reviews: reviews }))
    .setMimeType(ContentService.MimeType.JSON);
}