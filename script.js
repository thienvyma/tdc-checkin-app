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

    // Tự động đọc mã từ URL (?code=...) – hỗ trợ quét trực tiếp bằng camera hệ thống
    handleCodeFromUrl();
    
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

    // Khi bấm "Bật Camera", luôn hiển thị cảnh báo trước trên mọi thiết bị
    startBtn.addEventListener('click', function () {
        const message = [
            '📱 Khuyến nghị:',
            '- Trên điện thoại, nên ưu tiên dùng camera mặc định để quét mã QR trên E-ticket,',
            '  điện thoại sẽ tự mở trang TDC Check-in và hệ thống tự check-in.',
            '',
            'Bạn vẫn muốn bật camera trong trình duyệt để quét trực tiếp?'
        ].join('\n');

        const ok = window.confirm(message);
        if (!ok) return;

        startScanning();
    });

    stopBtn.addEventListener('click', stopScanning);
}

function startScanning() {
    // Nếu đang scan rồi, không làm gì
    if (isScanning) return;
    
    const qrReader = document.getElementById('qr-reader');
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    const qrResult = document.getElementById('qr-result');
    
    // Clear previous result
    if (qrResult) qrResult.style.display = 'none';
    
    // Reset processing flags
    isProcessingScan = false;
    lastScannedCode = ''; // Reset mã đã scan
    
    // Nếu scanner instance đã tồn tại và đang chạy, không làm gì
    if (html5QrCode && isScanning) {
        console.log('📷 Scanner đang chạy rồi');
        return;
    }
    
    // Nếu scanner instance đã tồn tại nhưng đã stop, start lại
    if (html5QrCode) {
        console.log('📷 Restarting existing scanner (no permission needed)...');
        // Dùng cấu hình "an toàn" theo docs của html5-qrcode để đảm bảo độ ổn định
        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                disableFlip: true
            },
            onScanSuccess,
            onScanError
        ).then(() => {
            isScanning = true;
            if (startBtn) {
                startBtn.style.display = 'none';
                startBtn.textContent = 'Bật Camera';
            }
            if (stopBtn) stopBtn.style.display = 'block';
            console.log('✅ QR scanner restarted (reused instance)');
            
            setTimeout(() => {
                const videoElement = qrReader.querySelector('video');
                if (videoElement) {
                    videoElement.style.transform = 'none';
                    videoElement.style.objectFit = 'cover';
                }
            }, 50);
        }).catch(err => {
            console.warn('⚠️ Restart failed, creating new instance:', err);
            // Nếu restart không được, tạo instance mới
            html5QrCode = null;
            initializeScanner();
        });
        return;
    }
    
    // Khởi tạo scanner mới (lần đầu tiên)
    initializeScanner();
}

function initializeScanner() {
    const qrReader = document.getElementById('qr-reader');
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    
    // Initialize scanner
    html5QrCode = new Html5Qrcode("qr-reader");
    
    console.log('📷 Starting QR scanner with safe default settings...');
    
    // Cấu hình đơn giản & ổn định theo khuyến nghị của thư viện
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            disableFlip: true
        },
        onScanSuccess,
        onScanError
    ).then(() => {
        isScanning = true;
        if (startBtn) {
            startBtn.style.display = 'none';
            startBtn.textContent = 'Bật Camera';
        }
        if (stopBtn) stopBtn.style.display = 'block';
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
        showError('Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera.');
        html5QrCode = null;
    });
}

function stopScanning() {
    if (!html5QrCode || !isScanning) return;
    
    // Stop scanner nhưng GIỮ instance để không phải xin quyền lại
    isScanning = false;
    isProcessingScan = false;
    lastScannedCode = ''; // Reset mã đã scan
    
    html5QrCode.stop().then(() => {
        console.log('✅ Scanner stopped (instance kept)');
    }).catch((err) => {
        console.warn('⚠️ Error stopping scanner:', err);
    });
    
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    const qrResult = document.getElementById('qr-result');
    
    if (startBtn) {
        startBtn.style.display = 'block';
        startBtn.textContent = 'Bật Camera';
    }
    if (stopBtn) stopBtn.style.display = 'none';
    if (qrResult) qrResult.style.display = 'none';
}

// Flag để tạm dừng xử lý scan (tránh scan nhiều lần)
let isProcessingScan = false;
let lastScannedCode = ''; // Lưu mã đã scan để tránh scan lại cùng một mã

function onScanSuccess(decodedText, decodedResult) {
    let raw = decodedText.trim();
    let ticketCode = '';

    // TH1: QR chứa URL ?code=... (quét bằng camera hệ thống hoặc trong app)
    try {
        if (raw.startsWith('http://') || raw.startsWith('https://')) {
            const urlObj = new URL(raw);
            const urlCode = urlObj.searchParams.get('code');
            if (urlCode) {
                ticketCode = urlCode.trim().toUpperCase();
            }
        }
    } catch (e) {
        console.warn('⚠️ Không parse được URL từ QR:', e);
    }

    // TH2: QR chỉ chứa mã EV-... như cũ
    if (!ticketCode) {
        ticketCode = raw.toUpperCase();
    }
    
    // Nếu đang xử lý scan trước đó, bỏ qua
    if (isProcessingScan) {
        console.log('⏸️ Đang xử lý scan trước đó, bỏ qua scan mới');
        return;
    }
    
    // Nếu scan lại cùng một mã trong thời gian ngắn, bỏ qua
    if (lastScannedCode === ticketCode) {
        console.log('⏸️ Đã scan mã này rồi, bỏ qua');
        return;
    }
    
    console.log('✅ QR Code scanned:', ticketCode);
    isProcessingScan = true; // Đánh dấu đang xử lý
    lastScannedCode = ticketCode; // Lưu mã đã scan
    
    // KHÔNG stop scanner - chỉ tạm dừng xử lý bằng flag
    // Điều này giúp giữ camera stream và không phải xin quyền lại
    
    // Update UI nhanh
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    if (startBtn) {
        startBtn.style.display = 'block';
        startBtn.textContent = 'Tiếp tục quét';
    }
    if (stopBtn) stopBtn.style.display = 'none';
    
    // Show scanned code
    const qrResult = document.getElementById('qr-result');
    if (qrResult) {
        qrResult.style.display = 'block';
        const resultText = qrResult.querySelector('.result-text');
        if (resultText) {
            resultText.textContent = `Đã quét: ${ticketCode}`;
        }
    }
    
    // Process check-in ngay lập tức (không delay)
    console.log('🚀 Processing check-in for:', ticketCode);
    processCheckin(ticketCode, 'qr');
}

function onScanError(errorMessage) {
    // Thêm log để dễ debug khi không nhận được mã
    console.debug('QR scan error frame:', errorMessage);
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
        resetUI();
    });
}

// Đọc mã từ query string (?code=...) và tự động check-in
function handleCodeFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const urlCode = params.get('code');
        if (!urlCode) return;

        const ticketCode = urlCode.trim().toUpperCase();
        const input = document.getElementById('ticket-code-input');

        // Điền vào ô nhập để admin thấy rõ
        if (input) {
            input.value = ticketCode;
        }

        console.log('🔗 Found code in URL, auto check-in:', ticketCode);
        processCheckin(ticketCode, 'qr-url');
    } catch (e) {
        console.warn('⚠️ handleCodeFromUrl error:', e);
    }
}

function resetUI() {
    // Hide result section
    const resultSection = document.getElementById('result-section');
    if (resultSection) resultSection.style.display = 'none';
    
    // Show tabs again
    const tabs = document.querySelector('.tabs');
    if (tabs) tabs.style.display = 'flex';
    
    // Clear manual input
    const ticketInput = document.getElementById('ticket-code-input');
    if (ticketInput) {
        ticketInput.value = '';
        ticketInput.classList.remove('error');
    }
    
    // Hide QR result
    const qrResult = document.getElementById('qr-result');
    if (qrResult) qrResult.style.display = 'none';
    
    // Hide input error
    hideInputError();
    
    // Reset to scan tab
    const manualTab = document.querySelector('[data-tab="manual"]');
    const scanTab = document.querySelector('[data-tab="scan"]');
    const manualTabContent = document.getElementById('manual-tab');
    const scanTabContent = document.getElementById('scan-tab');
    
    if (manualTab && scanTab && manualTabContent && scanTabContent) {
        manualTab.classList.remove('active');
        scanTab.classList.add('active');
        manualTabContent.classList.remove('active');
        scanTabContent.classList.add('active');
    }
    
    // Reset processing flags
    isProcessingScan = false;
    lastScannedCode = ''; // Reset mã đã scan
    
    // Reset buttons
    const startBtn = document.getElementById('start-scan-btn');
    const stopBtn = document.getElementById('stop-scan-btn');
    
    // Kiểm tra trạng thái scanner và tự động start lại nếu cần
    if (html5QrCode) {
        // Nếu scanner đang chạy, giữ nguyên
        if (isScanning) {
            console.log('📷 Scanner đang chạy, giữ nguyên');
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'block';
        } else {
            // Nếu scanner đã stop, tự động start lại
            console.log('📷 Scanner đã stop, tự động start lại...');
            if (startBtn) {
                startBtn.style.display = 'none';
                startBtn.textContent = 'Bật Camera';
            }
            if (stopBtn) stopBtn.style.display = 'block';
            
            // Tự động start scanner lại
            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 30,
                    qrbox: { width: 250, height: 250 },
                    disableFlip: true,
                    videoConstraints: {
                        facingMode: "environment",
                        width: { ideal: 320, max: 640 },
                        height: { ideal: 240, max: 480 }
                    }
                },
                onScanSuccess,
                onScanError
            ).then(() => {
                isScanning = true;
                console.log('✅ QR scanner tự động start lại sau reset UI');
                
                // Fix camera orientation
                setTimeout(() => {
                    const qrReader = document.getElementById('qr-reader');
                    if (qrReader) {
                        const videoElement = qrReader.querySelector('video');
                        if (videoElement) {
                            videoElement.style.transform = 'none';
                            videoElement.style.objectFit = 'cover';
                        }
                    }
                }, 50);
            }).catch(err => {
                console.warn('⚠️ Auto-start failed:', err);
                // Nếu auto-start không được, hiển thị nút "Bật Camera"
                if (startBtn) {
                    startBtn.style.display = 'block';
                    startBtn.textContent = 'Bật Camera';
                }
                if (stopBtn) stopBtn.style.display = 'none';
            });
        }
    } else {
        // Nếu chưa có scanner instance, hiển thị nút "Bật Camera"
        if (startBtn) {
            startBtn.style.display = 'block';
            startBtn.textContent = 'Bật Camera';
        }
        if (stopBtn) stopBtn.style.display = 'none';
    }
    
    console.log('✅ UI đã được reset');
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
    
    // Reset processing flag sau 2 giây để có thể scan tiếp
    setTimeout(() => {
        isProcessingScan = false;
        lastScannedCode = ''; // Reset mã đã scan sau 2 giây
        console.log('✅ Ready for next scan');
    }, 2000);
}

function showError(message) {
    console.error('❌ Error:', message);
    showResult({
        success: false,
        message: message,
        errorCode: 'CLIENT_ERROR'
    });
}

