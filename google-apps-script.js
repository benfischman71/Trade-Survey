// Google Apps Script for Trade Coffee AI Survey
// This script receives form submissions and saves them to Google Sheets

// ========================================
// MAIN FUNCTION - Handles POST requests
// ========================================
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the headers (first row)
    let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // If no headers exist, create them
    if (headers.length === 0 || headers[0] === '') {
      headers = createHeaders();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#3D2817')
        .setFontColor('#FFFFFF');
    }
    
    // Create row data matching headers
    const rowData = [];
    headers.forEach(header => {
      const key = headerToKey(header);
      rowData.push(data.responses[key] || '');
    });
    
    // Add timestamp at the beginning
    rowData.unshift(data.timestamp || new Date().toISOString());
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Format the new row
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, rowData.length)
      .setBorder(true, true, true, true, false, false)
      .setWrap(true);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function createHeaders() {
  return [
    'Timestamp',
    'Usage Level',
    'Tools Used',
    'Tools Other',
    'Usage Frequency',
    'Time Saved',
    'Integration Level',
    'Tasks Using AI',
    'Tasks Other',
    'Stopped Doing Manually',
    'Biggest Win',
    'Most Time Consuming Tasks',
    'Tried AI for Tasks',
    'What Went Wrong',
    'Barriers to Use',
    'Barriers Other',
    'Confidence Level',
    'Excitement Level',
    'Change Mind About AI',
    'Use First',
    'Support Needed',
    'Support Other',
    'Specific Prompt Needed',
    'Name',
    'Department',
    'Tenure',
    'Success Story'
  ];
}

function headerToKey(header) {
  const mapping = {
    'Timestamp': 'timestamp',
    'Usage Level': 'q1_usage_level',
    'Tools Used': 'q2_tools',
    'Tools Other': 'q2_tools_other',
    'Usage Frequency': 'q3_frequency',
    'Time Saved': 'q4_time_saved',
    'Integration Level': 'q5_integration',
    'Tasks Using AI': 'q6_tasks',
    'Tasks Other': 'q6_tasks_other',
    'Stopped Doing Manually': 'q7_stopped_doing',
    'Biggest Win': 'q8_biggest_win',
    'Most Time Consuming Tasks': 'q9_time_consuming',
    'Tried AI for Tasks': 'q10_tried_ai',
    'What Went Wrong': 'q10b_what_went_wrong',
    'Barriers to Use': 'q11_barriers',
    'Barriers Other': 'q11_barriers_other',
    'Confidence Level': 'q12_confidence',
    'Excitement Level': 'q13_excitement',
    'Change Mind About AI': 'q13b_change_mind',
    'Use First': 'q14_use_first',
    'Support Needed': 'q15_support',
    'Support Other': 'q15_support_other',
    'Specific Prompt Needed': 'q16_specific_prompt',
    'Name': 'q17_name',
    'Department': 'q18_department',
    'Tenure': 'q19_tenure',
    'Success Story': 'q20_success_story'
  };
  
  return mapping[header] || header.toLowerCase().replace(/ /g, '_');
}

// ========================================
// OPTIONAL: Analysis Functions
// ========================================

// Create a summary sheet with key metrics
function createSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('Responses') || ss.getActiveSheet();
  
  // Create or get summary sheet
  let summarySheet = ss.getSheetByName('Summary');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('Summary');
  } else {
    summarySheet.clear();
  }
  
  // Get all data
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  const responses = data.slice(1);
  
  // Calculate metrics
  const totalResponses = responses.length;
  
  // Usage level counts
  const usageLevels = {};
  responses.forEach(row => {
    const level = row[1]; // Usage level column
    usageLevels[level] = (usageLevels[level] || 0) + 1;
  });
  
  // Department breakdown
  const departments = {};
  responses.forEach(row => {
    const dept = row[24]; // Department column
    departments[dept] = (departments[dept] || 0) + 1;
  });
  
  // Write summary
  summarySheet.getRange('A1').setValue('Trade Coffee AI Survey Summary').setFontSize(16).setFontWeight('bold');
  summarySheet.getRange('A2').setValue(`Total Responses: ${totalResponses}`);
  
  let row = 4;
  summarySheet.getRange(`A${row}`).setValue('Usage Levels:').setFontWeight('bold');
  row++;
  for (let [level, count] of Object.entries(usageLevels)) {
    summarySheet.getRange(`A${row}`).setValue(level);
    summarySheet.getRange(`B${row}`).setValue(count);
    row++;
  }
  
  row += 2;
  summarySheet.getRange(`A${row}`).setValue('By Department:').setFontWeight('bold');
  row++;
  for (let [dept, count] of Object.entries(departments)) {
    summarySheet.getRange(`A${row}`).setValue(dept);
    summarySheet.getRange(`B${row}`).setValue(count);
    row++;
  }
}

// Set up triggers to run analysis after each submission
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Create new trigger
  ScriptApp.newTrigger('createSummary')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}
