/**
 * BACKEND GOOGLE APPS SCRIPT CHO CHECK-IN
 * 
 * Hướng dẫn deploy:
 * 1. Copy code này vào Google Apps Script Editor
 * 2. Deploy dưới dạng Web App
 * 3. Copy URL và paste vào config.js
 */

// ==================== CẤU HÌNH ====================
const CONFIG = {
  SPREADSHEET_ID: '1VHJLLb5QB8xFWGOtWPIOHxk4le7HgXbZaUITQgz0LcY',
  TICKET_SHEET_NAME: 'Mã Vé',
  LOG_SHEET_NAME: 'Log'
};

// ==================== DO POST (Xử lý POST request) ====================
function doPost(e) {
  try {
    // Handle case when e is undefined
    if (!e) {
      return createResponse(false, 'Invalid request', 'INVALID_REQUEST');
    }
    
    // Parse request data
    let data;
    try {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else {
        throw new Error('No postData');
      }
    } catch (parseError) {
      // Fallback: try to get from parameters (if available)
      if (e.parameter) {
        data = {
          ticketCode: e.parameter.ticketCode || '',
          checkinMethod: e.parameter.checkinMethod || 'unknown'
        };
      } else {
        return createResponse(false, 'Không có dữ liệu request', 'NO_DATA');
      }
    }
    
    const ticketCode = (data.ticketCode || '').trim().toUpperCase();
    
    if (!ticketCode) {
      return createResponse(false, 'Mã vé không được để trống', 'INVALID_INPUT');
    }
    
    // Validate format
    const pattern = /^EV-\d{8}-\d{6}-[A-Z0-9]{3}$/;
    if (!pattern.test(ticketCode)) {
      return createResponse(false, 'Mã vé không đúng định dạng', 'INVALID_FORMAT');
    }
    
    // Process check-in
    return processCheckin(ticketCode, data.checkinMethod || 'unknown');
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse(false, 'Lỗi hệ thống: ' + error.toString(), 'SYSTEM_ERROR');
  }
}

// ==================== DO GET (Xử lý GET request - workaround cho no-cors) ====================
function doGet(e) {
  try {
    // Handle case when e is undefined (testing directly)
    if (!e || !e.parameter) {
      // Default: return info when testing
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Check-in API is running',
        version: '1.0',
        note: 'This is a test response. Use POST or GET with parameters to check-in.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = e.parameter.action || '';
    const ticketCode = (e.parameter.ticketCode || '').trim().toUpperCase();
    const callback = e.parameter.callback || ''; // For JSONP support
    
    if (action === 'checkin' && ticketCode) {
      // Process check-in via GET (workaround)
      const result = processCheckin(ticketCode, e.parameter.checkinMethod || 'manual');
      
      // If callback provided, return JSONP
      if (callback) {
        try {
          const jsonContent = result.getContent();
          const jsonpResponse = callback + '(' + jsonContent + ');';
          return ContentService.createTextOutput(jsonpResponse)
            .setMimeType(ContentService.MimeType.JAVASCRIPT)
            .setHeaders({
              'Access-Control-Allow-Origin': '*'
            });
        } catch (e) {
          Logger.log('JSONP error: ' + e.toString());
          // Fallback to regular JSON
          return result;
        }
      }
      
      return result;
    }
    
    // Default: return info
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Check-in API is running',
      version: '1.0',
      parameters: {
        action: action || 'none',
        ticketCode: ticketCode || 'none'
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createResponse(false, 'Lỗi hệ thống: ' + error.toString(), 'SYSTEM_ERROR');
  }
}

// ==================== XỬ LÝ CHECK-IN ====================
function processCheckin(ticketCode, checkinMethod) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const ticketSheet = ss.getSheetByName(CONFIG.TICKET_SHEET_NAME);
    
    if (!ticketSheet) {
      return createResponse(false, 'Không tìm thấy sheet "Mã Vé"', 'SHEET_NOT_FOUND');
    }
    
    // Get all data
    const data = ticketSheet.getDataRange().getValues();
    let foundRow = -1;
    
    // Find ticket code (case-insensitive)
    for (let i = 1; i < data.length; i++) {
      const rowCode = (data[i][0] || '').toString().trim().toUpperCase();
      if (rowCode === ticketCode) {
        foundRow = i + 1;
        break;
      }
    }
    
    if (foundRow === -1) {
      return createResponse(false, 'Mã vé không tồn tại', 'TICKET_NOT_FOUND');
    }
    
    // Check status (column F = index 5)
    const status = (data[foundRow - 1][5] || '').toString().trim();
    
    if (status === 'Đã check-in') {
      // Get existing check-in time
      const checkinTime = data[foundRow - 1][6] || '';
      const name = data[foundRow - 1][2] || '';
      const email = data[foundRow - 1][1] || '';
      
      return createResponse(false, 'Mã vé này đã được check-in', 'ALREADY_CHECKED_IN', {
        ticketCode: ticketCode,
        name: name,
        email: email,
        checkinTime: checkinTime
      });
    }
    
    if (status !== 'Đã gửi email') {
      return createResponse(false, 'Mã vé chưa được kích hoạt', 'TICKET_NOT_ACTIVATED');
    }
    
    // Check-in successful
    const now = new Date();
    const checkinTime = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    
    // Update status (column F = index 6) với formatting nổi bật
    const statusRange = ticketSheet.getRange(foundRow, 6);
    Logger.log('📝 Updating status at row ' + foundRow + ', column 6');
    
    // Set value trước
    statusRange.setValue('Đã check-in');
    Logger.log('✅ Đã set value "Đã check-in"');
    
    // Update check-in time (column G = index 7)
    ticketSheet.getRange(foundRow, 7).setValue(checkinTime);
    
    // Get user info trước khi format (để đảm bảo có data trả về)
    const name = data[foundRow - 1][2] || '';
    const email = data[foundRow - 1][1] || '';
    
    // Format: In đậm + màu nền xanh lá nổi bật + màu chữ trắng
    try {
      Logger.log('🎨 Bắt đầu format cell...');
      statusRange.setFontWeight('bold');
      Logger.log('✅ Đã set font weight: bold');
      
      statusRange.setBackground('#28a745'); // Màu xanh lá đẹp
      Logger.log('✅ Đã set background: #28a745');
      
      statusRange.setFontColor('#ffffff'); // Chữ trắng để nổi bật
      Logger.log('✅ Đã set font color: #ffffff');
      
      statusRange.setHorizontalAlignment('center'); // Căn giữa cho đẹp
      Logger.log('✅ Đã set alignment: center');
      
      Logger.log('✅ Hoàn tất format trạng thái "Đã check-in" với màu xanh lá và chữ in đậm tại row ' + foundRow);
    } catch (formatError) {
      // Nếu formatting lỗi, log chi tiết
      Logger.log('❌ Formatting error: ' + formatError.toString());
      Logger.log('❌ Error stack: ' + formatError.stack);
      Logger.log('⚠️ Giá trị "Đã check-in" đã được cập nhật nhưng formatting có thể không áp dụng');
    }
    
    // Log check-in
    try {
      logCheckin(ticketCode, name, email, checkinTime, checkinMethod);
    } catch (logError) {
      Logger.log('⚠️ Log error (non-critical): ' + logError.toString());
    }
    
    // Trả về response ngay lập tức (không đợi formatting)
    return createResponse(true, 'Check-in thành công!', 'SUCCESS', {
      ticketCode: ticketCode,
      name: name,
      email: email,
      checkinTime: checkinTime
    });
    
  } catch (error) {
    Logger.log('Error in processCheckin: ' + error.toString());
    return createResponse(false, 'Lỗi hệ thống: ' + error.toString(), 'SYSTEM_ERROR');
  }
}

// ==================== GHI LOG ====================
function logCheckin(ticketCode, name, email, checkinTime, method) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let logSheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
    
    if (!logSheet) {
      // Create log sheet if not exists
      logSheet = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
      const headers = ['Thời gian', 'Loại', 'Trạng thái', 'Email', 'Họ tên', 'Số lượng', 'Mã vé', 'Row số', 'Thông báo', 'Lỗi'];
      logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    const now = new Date();
    const timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    
    const logRow = [
      timeStr,
      'Check-in',
      'Thành công',
      email || '',
      name || '',
      1,
      ticketCode,
      '',
      `Check-in thành công (${method})`,
      ''
    ];
    
    logSheet.appendRow(logRow);
    
  } catch (error) {
    Logger.log('Error logging check-in: ' + error.toString());
  }
}

// ==================== HELPER FUNCTIONS ====================
function createResponse(success, message, errorCode, data = null) {
  const response = {
    success: success,
    message: message,
    errorCode: errorCode || null
  };
  
  if (data) {
    response.data = data;
  }
  
  // Create output (CORS headers are handled automatically by Google Apps Script Web App)
  const output = ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

// Handle OPTIONS request for CORS preflight
function doOptions() {
  // CORS headers are handled automatically by Google Apps Script Web App
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

