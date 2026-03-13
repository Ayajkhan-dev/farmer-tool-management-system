/**
 * ========================================
 * FARMER TOOL MANAGER - JAVASCRIPT
 * ========================================
 * 
 * Features:
 * - Firebase Firestore integration
 * - Tool timer with localStorage persistence
 * - Rate management
 * - History tracking
 * - Udhaar (Khata) book
 * - App lock during tool operation
 */

// ========================================
// FIREBASE CONFIGURATION
// ========================================
// NOTE: Replace with your own Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db;
let firebaseInitialized = false;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // App will work in demo mode with localStorage
}

// ========================================
// APP STATE
// ========================================
const APP_STATE = {
    currentTool: null,
    startTime: null,
    isRunning: false,
    rates: {},
    timerInterval: null
};

// Tool list
const TOOLS = ['Cultivator', 'Rotavator', 'Leveler', 'Trolley'];

// ========================================
// LOCAL STORAGE KEYS
// ========================================
const STORAGE_KEYS = {
    RUNNING_STATE: 'ftm_running_state',
    RATES: 'ftm_rates',
    HISTORY: 'ftm_history',
    UDHAAR: 'ftm_udhaar'
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load rates from Firestore or localStorage
    loadRates();
    
    // Load history
    loadHistory();
    
    // Load udhaar
    loadUdhaar();
    
    // Check if there was a running tool (page refresh scenario)
    checkRunningState();
    
    // Set today's date in udhaar form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('udhaarDate').value = today;
}

// ========================================
// NAVIGATION
// ========================================
function navigateTo(pageId) {
    // Check if app is locked (tool running)
    if (APP_STATE.isRunning && pageId !== 'runningScreen') {
        showLockOverlay();
        return;
    }
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Close menu if open
    closeMenu();
    
    // Refresh data when navigating to specific pages
    if (pageId === 'history') {
        loadHistory();
    } else if (pageId === 'udhaar') {
        loadUdhaar();
    } else if (pageId === 'rates') {
        loadRates();
    }
}

// ========================================
// SIDE MENU
// ========================================
function toggleMenu() {
    // Don't allow menu toggle if app is locked
    if (APP_STATE.isRunning) {
        showLockOverlay();
        return;
    }
    
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    sideMenu.classList.toggle('open');
    menuOverlay.classList.toggle('show');
}

function closeMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
}

// ========================================
// LOCK OVERLAY
// ========================================
function showLockOverlay() {
    const lockOverlay = document.getElementById('lockOverlay');
    lockOverlay.style.display = 'flex';
}

function hideLockOverlay() {
    const lockOverlay = document.getElementById('lockOverlay');
    lockOverlay.style.display = 'none';
}

// ========================================
// DASHBOARD - TOOL SELECTION
// ========================================
function openStartScreen(toolName) {
    // Check if app is locked
    if (APP_STATE.isRunning) {
        showLockOverlay();
        return;
    }
    
    APP_STATE.currentTool = toolName;
    
    // Update start screen
    document.getElementById('startToolName').textContent = toolName;
    
    const rate = APP_STATE.rates[toolName] || 0;
    document.getElementById('startRateValue').textContent = '₹' + rate;
    
    // Show/hide warning and enable/disable start button
    const warning = document.getElementById('rateWarning');
    const startBtn = document.getElementById('startBtn');
    
    if (rate === 0) {
        warning.style.display = 'block';
        startBtn.disabled = true;
    } else {
        warning.style.display = 'none';
        startBtn.disabled = false;
    }
    
    navigateTo('startScreen');
}

// ========================================
// START TOOL
// ========================================
function startTool() {
    const rate = APP_STATE.rates[APP_STATE.currentTool] || 0;
    
    if (rate === 0) {
        alert('Please set the rate for this tool first!');
        return;
    }
    
    // Set running state
    APP_STATE.isRunning = true;
    APP_STATE.startTime = Date.now();
    
    // Save running state to localStorage
    saveRunningState();
    
    // Update running screen
    document.getElementById('runningToolName').textContent = APP_STATE.currentTool;
    
    // Start timer
    startTimer();
    
    // Lock the app
    lockApp();
    
    // Navigate to running screen
    navigateTo('runningScreen');
}

// ========================================
// TIMER FUNCTIONS
// ========================================
function startTimer() {
    updateTimerDisplay();
    
    APP_STATE.timerInterval = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
    const elapsed = Date.now() - APP_STATE.startTime;
    const formatted = formatTime(elapsed);
    document.getElementById('timerDisplay').textContent = formatted;
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function stopTimer() {
    if (APP_STATE.timerInterval) {
        clearInterval(APP_STATE.timerInterval);
        APP_STATE.timerInterval = null;
    }
}

// ========================================
// STOP TOOL
// ========================================
function stopTool() {
    const endTime = Date.now();
    const elapsedMs = endTime - APP_STATE.startTime;
    
    // Calculate total FULL minutes only (ignore seconds for billing)
    // Use Math.floor to count only complete minutes
    // Example: 59 seconds = 0 minutes, 1 min 10 sec = 1 minute
    const totalMinutes = Math.floor(elapsedMs / 60000);
    
    // Calculate cost based on full minutes only
    const ratePerHour = APP_STATE.rates[APP_STATE.currentTool] || 0;
    const ratePerMinute = ratePerHour / 60;
    const totalCost = Math.round(ratePerMinute * totalMinutes);
    
    // Create history record
    const record = {
        id: Date.now().toString(),
        tool: APP_STATE.currentTool,
        minutes: totalMinutes,
        cost: totalCost,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Save to Firestore and localStorage
    saveHistoryRecord(record);
    
    // Stop timer
    stopTimer();
    
    // Clear running state
    clearRunningState();
    
    // Unlock app
    unlockApp();
    
    // Show result
    showResult(record);
}

// ========================================
// SHOW RESULT
// ========================================
function showResult(record) {
    document.getElementById('resultToolName').textContent = record.tool;
    document.getElementById('resultTime').textContent = record.minutes + ' minutes';
    document.getElementById('resultCost').textContent = '₹' + record.cost;
    
    navigateTo('resultScreen');
}

// ========================================
// BACK TO DASHBOARD
// ========================================
function backToDashboard() {
    // Reset current tool
    APP_STATE.currentTool = null;
    APP_STATE.isRunning = false;
    APP_STATE.startTime = null;
    
    navigateTo('dashboard');
}

// ========================================
// APP LOCK/UNLOCK
// ========================================
function lockApp() {
    // Disable menu button
    document.getElementById('menuBtn').disabled = true;
    
    // Show lock overlay on other pages
    APP_STATE.isRunning = true;
}

function unlockApp() {
    // Enable menu button
    document.getElementById('menuBtn').disabled = false;
    
    // Hide lock overlay
    hideLockOverlay();
    
    APP_STATE.isRunning = false;
}

// ========================================
// RUNNING STATE (localStorage)
// ========================================
function saveRunningState() {
    const state = {
        currentTool: APP_STATE.currentTool,
        startTime: APP_STATE.startTime,
        isRunning: true
    };
    localStorage.setItem(STORAGE_KEYS.RUNNING_STATE, JSON.stringify(state));
}

function checkRunningState() {
    const saved = localStorage.getItem(STORAGE_KEYS.RUNNING_STATE);
    if (saved) {
        const state = JSON.parse(saved);
        if (state.isRunning && state.startTime) {
            // Restore running state
            APP_STATE.currentTool = state.currentTool;
            APP_STATE.startTime = state.startTime;
            APP_STATE.isRunning = true;
            
            // Lock app
            lockApp();
            
            // Update running screen
            document.getElementById('runningToolName').textContent = state.currentTool;
            
            // Start timer
            startTimer();
            
            // Navigate to running screen
            navigateTo('runningScreen');
        }
    }
}

function clearRunningState() {
    localStorage.removeItem(STORAGE_KEYS.RUNNING_STATE);
}

// ========================================
// RATES MANAGEMENT
// ========================================
async function loadRates() {
    // Try to load from Firestore first
    if (firebaseInitialized) {
        try {
            const snapshot = await db.collection('rates').doc('toolRates').get();
            if (snapshot.exists) {
                APP_STATE.rates = snapshot.data();
                updateRatesForm();
                return;
            }
        } catch (error) {
            console.error('Error loading rates from Firestore:', error);
        }
    }
    
    // Fallback to localStorage
    const savedRates = localStorage.getItem(STORAGE_KEYS.RATES);
    if (savedRates) {
        APP_STATE.rates = JSON.parse(savedRates);
    } else {
        // Initialize with 0
        TOOLS.forEach(tool => {
            APP_STATE.rates[tool] = 0;
        });
    }
    
    updateRatesForm();
}

function updateRatesForm() {
    document.getElementById('rateCultivator').value = APP_STATE.rates['Cultivator'] || '';
    document.getElementById('rateRotavator').value = APP_STATE.rates['Rotavator'] || '';
    document.getElementById('rateLeveler').value = APP_STATE.rates['Leveler'] || '';
    document.getElementById('rateTrolley').value = APP_STATE.rates['Trolley'] || '';
}

async function saveRates() {
    // Get values from form
    const rates = {
        Cultivator: parseInt(document.getElementById('rateCultivator').value) || 0,
        Rotavator: parseInt(document.getElementById('rateRotavator').value) || 0,
        Leveler: parseInt(document.getElementById('rateLeveler').value) || 0,
        Trolley: parseInt(document.getElementById('rateTrolley').value) || 0
    };
    
    // Save to state
    APP_STATE.rates = rates;
    
    // Save to Firestore
    if (firebaseInitialized) {
        try {
            await db.collection('rates').doc('toolRates').set(rates);
            console.log('Rates saved to Firestore');
        } catch (error) {
            console.error('Error saving rates to Firestore:', error);
        }
    }
    
    // Save to localStorage as backup
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
    
    alert('Rates saved successfully!');
    navigateTo('dashboard');
}

// ========================================
// HISTORY MANAGEMENT
// ========================================
async function loadHistory() {
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    
    let records = [];
    
    // Try to load from Firestore first
    if (firebaseInitialized) {
        try {
            const snapshot = await db.collection('history')
                .orderBy('timestamp', 'desc')
                .get();
            
            records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sync to localStorage
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
        } catch (error) {
            console.error('Error loading history from Firestore:', error);
        }
    }
    
    // Fallback to localStorage
    if (records.length === 0) {
        const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (saved) {
            records = JSON.parse(saved);
        }
    }
    
    // Render history
    renderHistory(records);
}

function renderHistory(records) {
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    
    if (records.length === 0) {
        historyList.innerHTML = '';
        emptyHistory.style.display = 'block';
        return;
    }
    
    emptyHistory.style.display = 'none';
    
    historyList.innerHTML = records.map(record => `
        <div class="history-item">
            <input type="checkbox" class="history-checkbox" value="${record.id}" data-id="${record.id}">
            <div class="history-content">
                <div class="history-tool">${record.tool}</div>
                <div class="history-details">
                    ${formatDate(record.date)} • ${record.minutes} min
                </div>
            </div>
            <div class="history-cost">₹${record.cost}</div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

async function saveHistoryRecord(record) {
    // Save to Firestore
    if (firebaseInitialized) {
        try {
            await db.collection('history').doc(record.id).set(record);
            console.log('History saved to Firestore');
        } catch (error) {
            console.error('Error saving history to Firestore:', error);
        }
    }
    
    // Save to localStorage
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    let records = saved ? JSON.parse(saved) : [];
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
}

async function deleteSelectedHistory() {
    const checkboxes = document.querySelectorAll('.history-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select at least one record to delete.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete the selected records?')) {
        return;
    }
    
    const idsToDelete = Array.from(checkboxes).map(cb => cb.value);
    
    // Delete from Firestore
    if (firebaseInitialized) {
        try {
            const batch = db.batch();
            idsToDelete.forEach(id => {
                const ref = db.collection('history').doc(id);
                batch.delete(ref);
            });
            await batch.commit();
            console.log('History deleted from Firestore');
        } catch (error) {
            console.error('Error deleting history from Firestore:', error);
        }
    }
    
    // Delete from localStorage
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
        let records = JSON.parse(saved);
        records = records.filter(r => !idsToDelete.includes(r.id));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
    }
    
    // Reload history
    loadHistory();
}

// ========================================
// UDHAAR (KHATA) MANAGEMENT
// ========================================
async function loadUdhaar() {
    const udhaarList = document.getElementById('udhaarList');
    const emptyUdhaar = document.getElementById('emptyUdhaar');
    
    let records = [];
    
    // Try to load from Firestore first
    if (firebaseInitialized) {
        try {
            const snapshot = await db.collection('udhaar')
                .orderBy('timestamp', 'desc')
                .get();
            
            records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sync to localStorage
            localStorage.setItem(STORAGE_KEYS.UDHAAR, JSON.stringify(records));
        } catch (error) {
            console.error('Error loading udhaar from Firestore:', error);
        }
    }
    
    // Fallback to localStorage
    if (records.length === 0) {
        const saved = localStorage.getItem(STORAGE_KEYS.UDHAAR);
        if (saved) {
            records = JSON.parse(saved);
        }
    }
    
    // Render udhaar
    renderUdhaar(records);
}

function renderUdhaar(records) {
    const udhaarList = document.getElementById('udhaarList');
    const emptyUdhaar = document.getElementById('emptyUdhaar');
    
    if (records.length === 0) {
        udhaarList.innerHTML = '';
        emptyUdhaar.style.display = 'block';
        return;
    }
    
    emptyUdhaar.style.display = 'none';
    
    udhaarList.innerHTML = records.map(record => `
        <div class="udhaar-card">
            <div class="udhaar-header">
                <span class="udhaar-name">${record.name}</span>
                <span class="udhaar-amount">₹${record.amount}</span>
            </div>
            <div class="udhaar-details">
                <span class="udhaar-mobile">${record.mobile}</span> • 
                <span class="udhaar-date">${formatDate(record.date)}</span>
            </div>
        </div>
    `).join('');
}

async function saveUdhaar() {
    const name = document.getElementById('udhaarName').value.trim();
    const mobile = document.getElementById('udhaarMobile').value.trim();
    const amount = parseInt(document.getElementById('udhaarAmount').value) || 0;
    const date = document.getElementById('udhaarDate').value;
    
    // Validation
    if (!name) {
        alert('Please enter a name.');
        return;
    }
    
    if (!mobile) {
        alert('Please enter a mobile number.');
        return;
    }
    
    if (amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }
    
    if (!date) {
        alert('Please select a date.');
        return;
    }
    
    // Create record
    const record = {
        id: Date.now().toString(),
        name: name,
        mobile: mobile,
        amount: amount,
        date: date,
        timestamp: Date.now()
    };
    
    // Save to Firestore
    if (firebaseInitialized) {
        try {
            await db.collection('udhaar').doc(record.id).set(record);
            console.log('Udhaar saved to Firestore');
        } catch (error) {
            console.error('Error saving udhaar to Firestore:', error);
        }
    }
    
    // Save to localStorage
    const saved = localStorage.getItem(STORAGE_KEYS.UDHAAR);
    let records = saved ? JSON.parse(saved) : [];
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.UDHAAR, JSON.stringify(records));
    
    // Clear form
    document.getElementById('udhaarName').value = '';
    document.getElementById('udhaarMobile').value = '';
    document.getElementById('udhaarAmount').value = '';
    
    // Reload udhaar list
    loadUdhaar();
    
    alert('Udhaar added successfully!');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// Get tool image path
function getToolImage(toolName) {
    const images = {
        'Cultivator': 'images/cultivator.jpg',
        'Leveler': 'images/leveler.png',
        'Trolley': 'images/trolley.jpg'
    };
    return images[toolName] || null;
}

// ========================================
// DEBUGGING HELPERS
// ========================================

// Clear all data (for testing)
function clearAllData() {
    if (confirm('This will delete ALL data. Are you sure?')) {
        localStorage.removeItem(STORAGE_KEYS.RATES);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.UDHAAR);
        localStorage.removeItem(STORAGE_KEYS.RUNNING_STATE);
        
        // Clear Firestore data if needed
        // Note: This would require individual document deletion
        
        alert('All local data cleared. Refreshing...');
        location.reload();
    }
}

// Export functions for console debugging
window.ftmDebug = {
    state: APP_STATE,
    clearData: clearAllData,
    loadRates: loadRates,
    loadHistory: loadHistory,
    loadUdhaar: loadUdhaar
};
