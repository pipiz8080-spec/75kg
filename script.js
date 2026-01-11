document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const STORAGE_KEY = 'weight_tracker_2026_01';
    // For this specific request, we are hardcoding Jan 2026
    const YEAR = 2026;
    const MONTH = 0; // January is 0 in JS
    const DAYS_IN_MONTH = 31;
    const FIRST_DAY_OF_WEEK = 4; // Jan 1st 2026 is a Thursday (0=Sun, 1=Mon... 4=Thu)

    // --- DOM Elements ---
    const weightInput = document.getElementById('weightInput');
    const saveBtn = document.getElementById('saveBtn');
    const messageEl = document.getElementById('message');
    const calendarGrid = document.getElementById('calendarGrid');
    const startWeightEl = document.getElementById('startWeight');
    const currentWeightEl = document.getElementById('currentWeight');
    const weightChangeEl = document.getElementById('weightChange');

    // --- State ---
    let weightData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let selectedDate = new Date().getDate(); // Default to today if in Jan, or just keep as variable holder
    
    // Check if we are actually allowed to simulate "Today" inside the target month
    // Since the user is asking for 2026, and it's currently NOT 2026, we should probably:
    // 1. If currently in Jan 2026 (future proof), select today.
    // 2. If not, maybe just default to 1st, or let user pick.
    // Let's implement a "Mock Date" safety or just default to allowing any date click.
    // For better UX now (testing), we will defaulting 'selectedDate' to 1 if we aren't in that month.
    
    const now = new Date();
    if (now.getFullYear() === YEAR && now.getMonth() === MONTH) {
        selectedDate = now.getDate();
    } else {
        selectedDate = null; // No auto-select if not in month, let user click or just show grid
    }

    // --- Functions ---

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(weightData));
        updateStats();
        renderCalendar();
    }

    function handleSave() {
        const val = parseFloat(weightInput.value);
        if (isNaN(val) || val <= 0 || val > 300) {
            showMessage('請輸入有效的體重！', 'error');
            return;
        }

        // Ideally we save for the "Selected Date". 
        // If no date selected (e.g. not in Jan 2026), we default to today if appropriate, or ask user to select.
        // Let's make the input ALWAYS correspond to the "Active" cell.
        
        if (!selectedDate) {
            // If we aren't "in" the month, force user to pick a date first?
            // Or just default to Date 1 for demo purposes?
            // Let's auto-select today's date number if valid, otherwise 1.
            let fallbackDate = new Date().getDate(); 
            if (fallbackDate > 31) fallbackDate = 1;
            selectedDate = fallbackDate;
        }

        weightData[selectedDate] = val;
        saveData();
        showMessage(`已記錄 ${selectedDate} 日體重: ${val}kg`, 'success');
        
        // Clear input to prevent accidental double submit? Or keep it for reference?
        // creating a better UX: keep it helps see what you just entered.
    }

    function showMessage(msg, type) {
        messageEl.textContent = msg;
        messageEl.className = `message ${type}`;
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }, 3000);
    }

    function updateStats() {
        const days = Object.keys(weightData).map(Number).sort((a, b) => a - b);
        
        if (days.length === 0) {
            startWeightEl.textContent = '--';
            currentWeightEl.textContent = '--';
            weightChangeEl.textContent = '--';
            weightChangeEl.className = 'neutral';
            return;
        }

        const firstWeight = weightData[days[0]];
        const lastWeight = weightData[days[days.length - 1]];

        startWeightEl.textContent = firstWeight.toFixed(1);
        currentWeightEl.textContent = lastWeight.toFixed(1);

        const change = lastWeight - firstWeight;
        const sign = change > 0 ? '+' : '';
        weightChangeEl.textContent = `${sign}${change.toFixed(1)} kg`;
        
        if (change > 0) {
            weightChangeEl.className = 'positive'; // Red (bad in weight loss context usually)
        } else if (change < 0) {
            weightChangeEl.className = 'negative'; // Green (good)
        } else {
            weightChangeEl.className = 'neutral';
        }
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';

        // Empty cells for days before the 1st
        for (let i = 0; i < FIRST_DAY_OF_WEEK; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Days 1-31
        for (let d = 1; d <= DAYS_IN_MONTH; d++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            
            // Content
            const dateNum = document.createElement('div');
            dateNum.className = 'date-num';
            dateNum.textContent = d;
            
            const weightVal = document.createElement('div');
            weightVal.className = 'weight-val';
            
            if (weightData[d]) {
                cell.classList.add('has-data');
                weightVal.textContent = weightData[d];
            } else {
                weightVal.textContent = '-';
            }

            cell.appendChild(dateNum);
            cell.appendChild(weightVal);

            // Interaction
            cell.addEventListener('click', () => {
                selectDate(d);
            });

            // Highlight selected
            if (d === selectedDate) {
                cell.classList.add('today'); // Using 'today' style for selection
                // Pre-fill input if data exists
                if (weightData[d]) {
                    weightInput.value = weightData[d];
                } else {
                    weightInput.value = '';
                }
            }

            calendarGrid.appendChild(cell);
        }
    }

    function selectDate(day) {
        selectedDate = day;
        // Update input placeholder/label maybe?
        const label = document.querySelector('label[for="weightInput"]');
        label.textContent = `1月${day}日 體重 (kg)`;
        
        // Re-render to move highlight
        renderCalendar();
    }

    // --- Init ---
    saveBtn.addEventListener('click', handleSave);
    
    // Allow Enter key in input
    weightInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSave();
    });

    // Initial Render
    if(selectedDate) selectDate(selectedDate);
    renderCalendar();
    updateStats();
});
