// Trade Coffee AI Survey - JavaScript

// Configuration
const CONFIG = {
    // Set your deadline here (format: 'YYYY-MM-DD HH:MM:SS')
    deadline: '2026-01-30 17:00:00', // Wednesday at 5pm
    
    // Google Sheets Web App URL (you'll get this after deploying the Google Apps Script)
    // Replace with your actual URL after setup
    googleSheetsURL: 'https://script.google.com/macros/s/AKfycbzT6pYXb_tjhJnLuPFOro2tVwXJhrVqCfFaSgFfRAsY7AGT3dlgTc1s6qIj0bRlhma8jw/exec',

    
    // Total number of sections
    totalSections: 7
};

// State
let currentSection = 1;
const formData = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initCountdown();
    initNavigation();
    initConditionalLogic();
    initFormSubmission();
});

// ========================================
// COUNTDOWN TIMER
// ========================================
function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const deadline = new Date(CONFIG.deadline).getTime();
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = "CLOSED";
        document.getElementById('deadlineBanner').style.background = 'linear-gradient(135deg, #DC3545 0%, #C82333 100%)';
        disableForm();
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let countdownText = '';
    
    if (days > 0) {
        countdownText = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        countdownText = `${hours}h ${minutes}m ${seconds}s`;
    } else {
        countdownText = `${minutes}m ${seconds}s`;
        // Change color to red when less than 1 hour
        document.getElementById('deadlineBanner').style.background = 'linear-gradient(135deg, #DC3545 0%, #C82333 100%)';
    }

    document.getElementById('countdown').innerHTML = countdownText;
}

function disableForm() {
    document.getElementById('surveyForm').innerHTML = `
        <div style="padding: 60px; text-align: center;">
            <h2 style="color: #DC3545; margin-bottom: 16px;">Survey Closed</h2>
            <p>This survey closed on ${CONFIG.deadline}.</p>
            <p>Please contact your manager if you need assistance.</p>
        </div>
    `;
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');

    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateCurrentSection()) {
            nextSection();
        }
    });

    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        previousSection();
    });

    updateNavigationButtons();
}

function showSection(sectionNumber) {
    // Hide all sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show current section
    const currentSectionElement = document.querySelector(`[data-section="${sectionNumber}"]`);
    if (currentSectionElement) {
        currentSectionElement.classList.add('active');
    }

    // Update progress bar
    updateProgressBar(sectionNumber);

    // Update navigation buttons
    updateNavigationButtons();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressBar(sectionNumber) {
    const progressBar = document.querySelector('.progress-bar::after') || document.querySelector('.progress-bar');
    const progressText = document.getElementById('progressText');
    const percentage = (sectionNumber / CONFIG.totalSections) * 100;
    
    // Update progress bar width via custom property
    document.documentElement.style.setProperty('--progress-width', `${percentage}%`);
    
    // Update text
    progressText.textContent = `Section ${sectionNumber} of ${CONFIG.totalSections}`;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // Show/hide previous button
    if (currentSection === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    // Show/hide next vs submit button
    if (currentSection === CONFIG.totalSections) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function nextSection() {
    if (currentSection < CONFIG.totalSections) {
        currentSection++;
        showSection(currentSection);
    }
}

function previousSection() {
    if (currentSection > 1) {
        currentSection--;
        showSection(currentSection);
    }
}

// ========================================
// VALIDATION
// ========================================
function validateCurrentSection() {
    const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
    const requiredInputs = currentSectionElement.querySelectorAll('[required]');
    let isValid = true;

    // Remove previous error states
    currentSectionElement.querySelectorAll('.has-error').forEach(el => {
        el.classList.remove('has-error');
    });

    requiredInputs.forEach(input => {
        // Check radio buttons
        if (input.type === 'radio') {
            const radioName = input.name;
            const radioGroup = currentSectionElement.querySelectorAll(`input[name="${radioName}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!isChecked) {
                isValid = false;
                const questionGroup = input.closest('.question-group');
                if (questionGroup) {
                    questionGroup.classList.add('has-error');
                    showError(questionGroup, 'Please select an option');
                }
            }
        }
        // Check text inputs and textareas
        else if (input.type === 'text' || input.tagName === 'TEXTAREA') {
            if (!input.value.trim()) {
                isValid = false;
                const questionGroup = input.closest('.question-group');
                if (questionGroup) {
                    questionGroup.classList.add('has-error');
                    showError(questionGroup, 'This field is required');
                }
            }
        }
        // Check checkboxes (at least one must be checked for required checkbox groups)
        else if (input.type === 'checkbox') {
            const checkboxName = input.name;
            const checkboxGroup = currentSectionElement.querySelectorAll(`input[name="${checkboxName}"]`);
            const isChecked = Array.from(checkboxGroup).some(checkbox => checkbox.checked);
            
            if (!isChecked && input.required) {
                isValid = false;
                const questionGroup = input.closest('.question-group');
                if (questionGroup && !questionGroup.classList.contains('has-error')) {
                    questionGroup.classList.add('has-error');
                    showError(questionGroup, 'Please select at least one option');
                }
            }
        }
    });

    if (!isValid) {
        // Scroll to first error
        const firstError = currentSectionElement.querySelector('.has-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isValid;
}

function showError(element, message) {
    // Check if error message already exists
    let errorMsg = element.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        element.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
}

// ========================================
// CONDITIONAL LOGIC
// ========================================
function initConditionalLogic() {
    // Question 10b: Show if Q10 = "yes_failed"
    const q10Inputs = document.querySelectorAll('input[name="q10_tried_ai"]');
    q10Inputs.forEach(input => {
        input.addEventListener('change', function() {
            const q10bContainer = document.getElementById('q10b_container');
            if (this.value === 'yes_failed' && this.checked) {
                q10bContainer.style.display = 'block';
            } else if (this.checked) {
                q10bContainer.style.display = 'none';
            }
        });
    });

    // Question 13b: Show if Q13 = 1 or 2
    const q13Inputs = document.querySelectorAll('input[name="q13_excitement"]');
    q13Inputs.forEach(input => {
        input.addEventListener('change', function() {
            const q13bContainer = document.getElementById('q13b_container');
            if ((this.value === '1' || this.value === '2') && this.checked) {
                q13bContainer.style.display = 'block';
            } else if (this.checked) {
                q13bContainer.style.display = 'none';
            }
        });
    });
}

// ========================================
// FORM SUBMISSION
// ========================================
function initFormSubmission() {
    const form = document.getElementById('surveyForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateCurrentSection()) {
            return;
        }

        // Collect all form data
        const formData = new FormData(form);
        const data = {
            timestamp: new Date().toISOString(),
            responses: {}
        };

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            // Handle multiple values (checkboxes)
            if (data.responses[key]) {
                if (Array.isArray(data.responses[key])) {
                    data.responses[key].push(value);
                } else {
                    data.responses[key] = [data.responses[key], value];
                }
            } else {
                data.responses[key] = value;
            }
        }

        // Handle checkboxes that might have multiple values
        const checkboxGroups = ['q2_tools', 'q6_tasks', 'q11_barriers', 'q15_support'];
        checkboxGroups.forEach(group => {
            const checkboxes = form.querySelectorAll(`input[name="${group}"]:checked`);
            const values = Array.from(checkboxes).map(cb => cb.value);
            if (values.length > 0) {
                data.responses[group] = values.join(', ');
            }
        });

        // Submit to Google Sheets
        submitToGoogleSheets(data);
    });
}

function submitToGoogleSheets(data) {
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    document.getElementById('surveyForm').classList.add('loading');

    // If Google Sheets URL is not configured, show success anyway (for testing)
    if (!CONFIG.googleSheetsURL || CONFIG.googleSheetsURL === 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE') {
        console.log('Form data (Google Sheets not configured):', data);
        setTimeout(() => {
            showSuccessModal();
        }, 1000);
        return;
    }

    // Submit to Google Sheets
    fetch(CONFIG.googleSheetsURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        showSuccessModal();
    })
    .catch(error => {
        console.error('Error:', error);
        // Show success anyway since no-cors doesn't give us response
        showSuccessModal();
    });
}

function showSuccessModal() {
    document.getElementById('successModal').style.display = 'flex';
    
    // Prevent form resubmission
    document.getElementById('surveyForm').reset();
    
    // Optional: Redirect after a few seconds
    // setTimeout(() => {
    //     window.location.href = 'https://drinktrade.com';
    // }, 5000);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Update progress bar width dynamically
const style = document.createElement('style');
style.textContent = `
    .progress-bar::after {
        width: var(--progress-width, 14.28%);
    }
`;
document.head.appendChild(style);

// Initial progress
document.documentElement.style.setProperty('--progress-width', '14.28%');

// Prevent accidental page navigation
window.addEventListener('beforeunload', function(e) {
    const form = document.getElementById('surveyForm');
    const hasData = Array.from(new FormData(form)).length > 0;
    
    if (hasData && !document.getElementById('successModal').style.display) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Auto-save to localStorage (optional)
function autoSave() {
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem('tradeSurveyDraft', JSON.stringify(data));
}

// Restore from localStorage on page load
function restoreDraft() {
    const draft = localStorage.getItem('tradeSurveyDraft');
    if (draft) {
        const data = JSON.parse(draft);
        const form = document.getElementById('surveyForm');
        
        for (let [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    const option = form.querySelector(`[name="${key}"][value="${value}"]`);
                    if (option) option.checked = true;
                } else {
                    input.value = value;
                }
            }
        }
    }
}

// Clear draft after successful submission
function clearDraft() {
    localStorage.removeItem('tradeSurveyDraft');
}

// Call restoreDraft on load if you want to implement auto-save
// restoreDraft();

// Optional: Auto-save every 30 seconds
// setInterval(autoSave, 30000);
