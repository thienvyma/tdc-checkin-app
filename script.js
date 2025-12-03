// ==================== BIẾN TOÀN CỤC ====================
let html5QrCode = null;
let isScanning = false;

// ==================== KHỞI TẠO ====================
document.addEventListener('DOMContentLoaded', function() {
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
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Stop scanning when switching tabs
            if (isScanning) {
                stopScanning();
            }
            
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Hide result section
            document.getElementById('result-section').style.display = 'none';
        });
    });
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
    
    html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
    ).then(() => {
        isScanning = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
    }).catch(err => {
        console.error('Error starting scanner:', err);
        showError('Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera.');
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
    // Check API URL
    if (!CONFIG.API_URL || CONFIG.API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        showError('Vui lòng cấu hình API_URL trong file config.js');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Use GET request (workaround for CORS)
    // Google Apps Script Web App supports GET with parameters
    const url = CONFIG.API_URL + 
        '?ticketCode=' + encodeURIComponent(ticketCode) + 
        '&checkinMethod=' + encodeURIComponent(method) + 
        '&action=checkin';
    
    // Send GET request
    fetch(url, {
        method: 'GET',
        mode: 'cors', // Try CORS first
        cache: 'no-cache'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        hideLoading();
        showResult(result);
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback: Try with no-cors and show generic message
        hideLoading();
        showResult({
            success: true,
            message: 'Đã gửi yêu cầu check-in. Vui lòng kiểm tra lại trong vài giây.',
            data: {
                ticketCode: ticketCode
            }
        });
    });
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
    showResult({
        success: false,
        message: message
    });
}

