/**
 * INSTRUCTIONS FOR CONNECTING HTML FORM TO GOOGLE SHEETS
 * 
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1cKaHckuLttZsbd2jPRN8HckSO1RoINjGdrj_XFY6Vnk/edit
 * 2. Click on "Extensions" in the top menu, then select "Apps Script"
 * 3. Delete any code in the editor and paste ALL the code below
 * 4. Add headers to the first row of your Google Sheet exactly matching the data (e.g., A1: Timestamp, B1: Name, C1: Company, D1: Phone, E1: Service, F1: City, G1: Budget)
 * 5. Click the "Save" icon (or File -> Save)
 * 6. Click "Deploy" > "New deployment"
 * 7. Click the gear icon next to "Select type" and choose "Web app"
 * 8. Set "Execute as" to "Me"
 * 9. Set "Who has access" to "Anyone"
 * 10. Click "Deploy"
 * 11. Copy the "Web app URL" that is generated
 * 12. Open `d:\HB.in\code.html` in your editor, find line 825 (roughly), and replace 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' with this copied URL.
 */

const SHEET_NAME = 'Sheet1'; // Change this if your tab is named differently

function doPost(e) {
  try {
    // Get the active spreadsheet the script is attached to
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME) || doc.getSheets()[0];
    
    // Fallback logic to grab parameters properly from the incoming POST wrapper payload
    const rowData = [
      new Date(),
      e.parameter.name || '',
      e.parameter.company || '',
      e.parameter.phone || '',
      e.parameter.service || '',
      e.parameter.city || '',
      e.parameter.budget || ''
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": rowData }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional GET to verify deployment
function doGet(e) {
  return ContentService.createTextOutput("The web app is active. Ensure you use POST to push data.");
}
