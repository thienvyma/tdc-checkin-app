// ==================== BIẾN TOÀN CỤC ====================
let html5QrCode = null;
let isScanning = false;

// ==================== KHỞI TẠO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Webapp Check-in đã khởi động');
    console.log('📋 CONFIG:', CONFIG);
    
    // Check if CONFIG is loaded
    if (!CONFIG || !CONFIG.API_URL) {
        console.error('❌ CONFIG không được load. Kiểm tra file config.js');
        alert('Lỗi: Không thể load cấu hình. Vui lòng kiểm tra file config.js');
        return;
    }
    
    if (CONFIG.API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.warn('⚠️ API_URL chưa được cấu hình');
        alert('Cảnh báo: API_URL chưa được cấu hình. Vui lòng cập nhật file config.js');
    }
    
    initTabs();
    initScanButton();
    initManualInput();
    initCheckinButton();
    initCheckinAnotherButton();
    
    // Auto-focus input khi chuyển sang tab manual
    document.querySelector('[data-tab="manual"]').addEventListener('click', function() {
        setTimeout(() => {
            document.getElementById('ticket-code-input').focus();
        }, 100);
    });
});

// ==================== TAB NAVIGATION ====================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('🔧 Khởi tạo tabs, tìm thấy', tabButtons.length, 'buttons');
    
    tabButtons.forEach((btn, index) => {
        console.log('🔘 Tab button', index, btn.getAttribute('data-tab'));
        
        // Use both click and touchstart for better mobile support
        ['click', 'touchend'].forEach(eventType => {
            btn.addEventListener(eventType, function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('👆 Tab clicked:', this.getAttribute('data-tab'));
                
                const targetTab = this.getAttribute('data-tab');
                
                if (!targetTab) {
                    console.error('❌ No data-tab attribute');
                    return;
                }
                
                // Stop scanning when switching tabs
                if (isScanning) {
                    stopScanning();
                }
                
                // Update active tab
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                this.classList.add('active');
                const targetElement = document.getElementById(targetTab + '-tab');
                
                if (targetElement) {
                    targetElement.classList.add('active');
                    console.log('✅ Switched to tab:', targetTab);
                } else {
                    console.error('❌ Tab element not found:', targetTab + '-tab');
                }
                
                // Hide result section
                const resultSection = document.getElementById('result-section');
                if (resultSection) {
                    resultSection.style.display = 'none';
                }
            }, { passive: false });
        });
    });
    
    // Verify tabs are initialized
    if (tabButtons.length === 0) {
        console.error('❌ No tab buttons found!');
    }
}

// ==================== QR CODE SCANNER ====================
function initScanButton() {
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    
    startBtn.addEventListener('click', startScanning);
    stopBtn.addEventListener('click', stopScanning);
}

function startScanning() {
    if (isScanning) return;
    
    const qrReader = document.getElementById('qr-reader');
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    const qrResult = document.getElementById('qr-result');
    
    // Clear previous result
    qrResult.style.display = 'none';
    
    // Initialize scanner
    html5QrCode = new Html5Qrcode("qr-reader");
    
    console.log('📷 Starting QR scanner with MAXIMUM SPEED settings...');
    
    // TỐI ƯU TỐC ĐỘ TỐI ĐA - Giảm resolution và QR box để xử lý nhanh nhất
    html5QrCode.start(
        { 
            facingMode: "environment"
        },
        {
            fps: 30, // FPS cao để quét nhiều frame hơn
            qrbox: { 
                width: 250, // QR box nhỏ hơn = xử lý ít pixel hơn = nhanh hơn
                height: 250 
            },
            // Bỏ aspectRatio và các tùy chọn không cần thiết
            disableFlip: true,
            // Resolution THẤP NHẤT có thể để tăng tốc độ xử lý
            videoConstraints: {
                facingMode: "environment",
                width: { ideal: 320, max: 640 }, // Resolution rất thấp để xử lý nhanh
                height: { ideal: 240, max: 480 }
            }
        },
        onScanSuccess,
        onScanError
    ).then(() => {
        isScanning = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        console.log('✅ QR scanner started with fast settings');
        
        // Fix camera orientation
        setTimeout(() => {
            const videoElement = qrReader.querySelector('video');
            if (videoElement) {
                videoElement.style.transform = 'none';
                videoElement.style.objectFit = 'cover';
            }
        }, 50);
    }).catch(err => {
        console.error('❌ Error starting scanner:', err);
        // Fallback với settings đơn giản nhất
        console.log('⚠️ Trying with minimal settings...');
        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 30,
                qrbox: { width: 250, height: 250 }
                // Không set videoConstraints để browser tự chọn resolution thấp nhất
            },
            onScanSuccess,
            onScanError
        ).then(() => {
            isScanning = true;
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            
            setTimeout(() => {
                const videoElement = qrReader.querySelector('video');
                if (videoElement) {
                    videoElement.style.transform = 'none';
                    videoElement.style.objectFit = 'cover';
                }
            }, 50);
        }).catch(err2 => {
            console.error('❌ Error with fallback settings:', err2);
            showError('Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera.');
        });
    });
}

function stopScanning() {
    if (!isScanning || !html5QrCode) return;
    
    html5QrCode.stop().then(() => {
        html5QrCode.clear();
        html5QrCode = null;
        isScanning = false;
        
        document.getElementById('start-scan-btn').style.display = 'block';
        document.getElementById('stop-scan-btn').style.display = 'none';
        document.getElementById('qr-result').style.display = 'none';
    }).catch(err => {
        console.error('Error stopping scanner:', err);
    });
}

function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning
    stopScanning();
    
    // Show scanned code
    const qrResult = document.getElementById('qr-result');
    qrResult.style.display = 'block';
    qrResult.querySelector('.result-text').textContent = `Đã quét: ${decodedText}`;
    
    // Process check-in
    processCheckin(decodedText.trim().toUpperCase(), 'qr');
}

function onScanError(errorMessage) {
    // Ignore scanning errors (they happen frequently during scanning)
}

// ==================== MANUAL INPUT ====================
function initManualInput() {
    const input = document.getElementById('ticket-code-input');
    
    // Auto uppercase and trim
    input.addEventListener('input', function(e) {
        let value = e.target.value.toUpperCase().trim();
        e.target.value = value;
        
        // Clear error on input
        hideInputError();
    });
    
    // Validate on blur
    input.addEventListener('blur', function() {
        validateTicketCode(input.value);
    });
    
    // Check-in on Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('checkin-btn').click();
        }
    });
}

function validateTicketCode(code) {
    const errorDiv = document.getElementById('input-error');
    const input = document.getElementById('ticket-code-input');
    
    if (!code) {
        return false;
    }
    
    // Format: EV-YYYYMMDD-HHMMSS-XXX
    const pattern = /^EV-\d{8}-\d{6}-[A-Z0-9]{3}$/;
    
    if (!pattern.test(code)) {
        showInputError('Mã vé không đúng định dạng. Ví dụ: EV-20251204-014944-DRI');
        input.classList.add('error');
        return false;
    }
    
    hideInputError();
    input.classList.remove('error');
    return true;
}

function showInputError(message) {
    const errorDiv = document.getElementById('input-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideInputError() {
    const errorDiv = document.getElementById('input-error');
    errorDiv.style.display = 'none';
}

// ==================== CHECK-IN BUTTON ====================
function initCheckinButton() {
    document.getElementById('checkin-btn').addEventListener('click', function() {
        const input = document.getElementById('ticket-code-input');
        const ticketCode = input.value.trim().toUpperCase();
        
        if (!ticketCode) {
            showInputError('Vui lòng nhập mã vé');
            return;
        }
        
        if (!validateTicketCode(ticketCode)) {
            return;
        }
        
        processCheckin(ticketCode, 'manual');
    });
}

function initCheckinAnotherButton() {
    document.getElementById('checkin-another-btn').addEventListener('click', function() {
        // Reset UI
        document.getElementById('result-section').style.display = 'none';
        document.getElementById('ticket-code-input').value = '';
        document.getElementById('qr-result').style.display = 'none';
        hideInputError();
        
        // Focus on input if manual tab is active
        if (document.getElementById('manual-tab').classList.contains('active')) {
            document.getElementById('ticket-code-input').focus();
        }
    });
}

// ==================== PROCESS CHECK-IN ====================
function processCheckin(ticketCode, method) {
    console.log('🚀 Bắt đầu check-in:', { ticketCode, method });
    
    // Check API URL
    if (!CONFIG || !CONFIG.API_URL || CONFIG.API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.error('❌ API_URL chưa được cấu hình');
        showError('Vui lòng cấu hình API_URL trong file config.js');
        return;
    }
    
    // Validate ticket code format
    const pattern = /^EV-\d{8}-\d{6}-[A-Z0-9]{3}$/;
    if (!pattern.test(ticketCode)) {
        console.error('❌ Mã vé không đúng format:', ticketCode);
        showError('Mã vé không đúng định dạng. Ví dụ: EV-20251204-014944-DRI');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Build URL with parameters
    const url = CONFIG.API_URL + 
        '?ticketCode=' + encodeURIComponent(ticketCode) + 
        '&checkinMethod=' + encodeURIComponent(method) + 
        '&action=checkin';
    
    console.log('📡 Gửi request đến:', url);
    
    // Try multiple methods for better compatibility
    // Method 1: XMLHttpRequest
    tryXHRRequest(url);
}

// Try XMLHttpRequest first
function tryXHRRequest(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.timeout = 20000; // 20 seconds timeout
    
    xhr.onload = function() {
        console.log('📥 XHR Response status:', xhr.status);
        console.log('📥 XHR Response text:', xhr.responseText);
        
        // Google Apps Script Web App can return 200, 0, or 304
        if (xhr.status === 200 || xhr.status === 0 || xhr.status === 304) {
            processResponse(xhr.responseText);
        } else {
            console.error('❌ XHR HTTP Error:', xhr.status, xhr.statusText);
            // Try JSONP as fallback
            tryJSONPRequest(url);
        }
    };
    
    xhr.onerror = function() {
        console.error('❌ XHR Network error');
        // Try JSONP as fallback
        tryJSONPRequest(url);
    };
    
    xhr.ontimeout = function() {
        console.error('❌ XHR Request timeout');
        hideLoading();
        showError('Request timeout. Server không phản hồi. Vui lòng thử lại sau.');
    };
    
    try {
        xhr.send();
    } catch (e) {
        console.error('❌ XHR Send error:', e);
        // Try JSONP as fallback
        tryJSONPRequest(url);
    }
}

// Fallback: JSONP method (works better with Google Apps Script CORS)
function tryJSONPRequest(url) {
    console.log('🔄 Trying JSONP method...');
    
    // Create callback function name
    const callbackName = 'checkinCallback_' + Date.now();
    
    // Create script tag
    const script = document.createElement('script');
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    
    // Create global callback
    window[callbackName] = function(data) {
        console.log('📥 JSONP Response:', data);
        delete window[callbackName];
        document.body.removeChild(script);
        processResponse(JSON.stringify(data));
    };
    
    // Error handling
    script.onerror = function() {
        console.error('❌ JSONP Error');
        delete window[callbackName];
        document.body.removeChild(script);
        hideLoading();
        showError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.');
    };
    
    // Timeout
    setTimeout(function() {
        if (window[callbackName]) {
            console.error('❌ JSONP Timeout');
            delete window[callbackName];
            if (script.parentNode) {
                document.body.removeChild(script);
            }
            hideLoading();
            showError('Request timeout. Vui lòng thử lại sau.');
        }
    }, 20000);
    
    document.body.appendChild(script);
}

// Process response (common for both methods)
function processResponse(responseText) {
    hideLoading();
    
    if (!responseText) {
        showError('Không nhận được phản hồi từ server.');
        return;
    }
    
    try {
        // Remove any potential BOM, whitespace, or HTML wrapper
        let cleanText = responseText.trim();
        
        // Remove HTML tags if wrapped
        if (cleanText.includes('<') && cleanText.includes('>')) {
            // Extract JSON from HTML
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            }
        }
        
        // Remove any leading/trailing characters that might break JSON
        cleanText = cleanText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
        
        console.log('📝 Cleaned response:', cleanText);
        
        // Parse JSON
        const result = JSON.parse(cleanText);
        console.log('✅ Parsed result:', result);
        showResult(result);
        
    } catch (e) {
        console.error('❌ Parse error:', e);
        console.error('Original response:', responseText);
        showError('Không thể đọc phản hồi từ server. Vui lòng kiểm tra Console để xem chi tiết hoặc thử lại.');
    }
}

// ==================== UI HELPERS ====================
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showResult(result) {
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    
    // Hide tabs and show result
    document.querySelector('.tabs').style.display = 'none';
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    if (result.success) {
        resultContent.innerHTML = `
            <div class="result-success">
                <h3>✅ Check-in thành công!</h3>
                <div class="info">
                    <div class="info-item"><strong>Mã vé:</strong> ${result.data.ticketCode || ''}</div>
                    ${result.data.name ? `<div class="info-item"><strong>Họ tên:</strong> ${result.data.name}</div>` : ''}
                    ${result.data.email ? `<div class="info-item"><strong>Email:</strong> ${result.data.email}</div>` : ''}
                    ${result.data.checkinTime ? `<div class="info-item"><strong>Thời gian:</strong> ${result.data.checkinTime}</div>` : ''}
                </div>
            </div>
        `;
    } else {
        resultContent.innerHTML = `
            <div class="result-error">
                <h3>❌ Check-in thất bại</h3>
                <p>${result.message || 'Có lỗi xảy ra'}</p>
            </div>
        `;
    }
    
    resultSection.style.display = 'block';
}

function showError(message) {
    console.error('❌ Error:', message);
    showResult({
        success: false,
        message: message,
        errorCode: 'CLIENT_ERROR'
    });
}

