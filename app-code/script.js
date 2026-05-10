/**
 * ===================================================
 * DYNAMIC EVENT REGISTRATION SYSTEM — script.js
 * Author: EduEvents Portal
 * Description: All JS logic for form rendering,
 *              async data fetching, and validation.
 * ===================================================
 */

'use strict';

/* ── Embedded Departments Data (mirrors departments.json) ── */
const DEPARTMENTS_DATA = {
  undergraduate: [
    { id: 'ug-cs',   name: 'Computer Science',                faculty: 'Science & Technology' },
    { id: 'ug-ee',   name: 'Electrical Engineering',          faculty: 'Engineering' },
    { id: 'ug-me',   name: 'Mechanical Engineering',          faculty: 'Engineering' },
    { id: 'ug-ce',   name: 'Civil Engineering',               faculty: 'Engineering' },
    { id: 'ug-ch',   name: 'Chemical Engineering',            faculty: 'Engineering' },
    { id: 'ug-math', name: 'Mathematics',                     faculty: 'Science & Technology' },
    { id: 'ug-phy',  name: 'Physics',                         faculty: 'Science & Technology' },
    { id: 'ug-bio',  name: 'Biology',                         faculty: 'Life Sciences' },
    { id: 'ug-chem', name: 'Chemistry',                       faculty: 'Science & Technology' },
    { id: 'ug-econ', name: 'Economics',                       faculty: 'Social Sciences' },
    { id: 'ug-acc',  name: 'Accounting',                      faculty: 'Business & Management' },
    { id: 'ug-biz',  name: 'Business Administration',         faculty: 'Business & Management' },
    { id: 'ug-law',  name: 'Law',                             faculty: 'Law' },
    { id: 'ug-med',  name: 'Medicine & Surgery',              faculty: 'Health Sciences' },
    { id: 'ug-nur',  name: 'Nursing',                         faculty: 'Health Sciences' },
    { id: 'ug-arch', name: 'Architecture',                    faculty: 'Environmental Design' },
    { id: 'ug-eng',  name: 'English Language',                faculty: 'Humanities' },
    { id: 'ug-his',  name: 'History & International Studies', faculty: 'Humanities' },
    { id: 'ug-pols', name: 'Political Science',               faculty: 'Social Sciences' },
    { id: 'ug-soc',  name: 'Sociology',                       faculty: 'Social Sciences' },
  ],
  postgraduate: [
    { id: 'pg-cs',   name: 'Computer Science (M.Sc)',         faculty: 'Science & Technology' },
    { id: 'pg-ai',   name: 'Artificial Intelligence (M.Sc)', faculty: 'Science & Technology' },
    { id: 'pg-ds',   name: 'Data Science & Analytics',        faculty: 'Science & Technology' },
    { id: 'pg-ee',   name: 'Electrical Engineering (M.Eng)',  faculty: 'Engineering' },
    { id: 'pg-me',   name: 'Mechanical Engineering (M.Eng)', faculty: 'Engineering' },
    { id: 'pg-mba',  name: 'Business Administration (MBA)',   faculty: 'Business & Management' },
    { id: 'pg-fin',  name: 'Finance & Investment Banking',    faculty: 'Business & Management' },
    { id: 'pg-law',  name: 'International Law (LLM)',         faculty: 'Law' },
    { id: 'pg-pub',  name: 'Public Health (MPH)',             faculty: 'Health Sciences' },
    { id: 'pg-edu',  name: 'Education Administration',        faculty: 'Education' },
    { id: 'pg-econ', name: 'Economics',                       faculty: 'Social Sciences' },
    { id: 'pg-env',  name: 'Environmental Science',           faculty: 'Environmental Sciences' },
    { id: 'pg-cy',   name: 'Cybersecurity',                   faculty: 'Science & Technology' },
    { id: 'pg-arch', name: 'Architecture (M.Arch)',           faculty: 'Environmental Design' },
    { id: 'pg-comm', name: 'Mass Communication',              faculty: 'Humanities' },
  ],
  hostels: {
    male: [
      { id: 'h-m1', name: 'Sango Hall',        capacity: 200, type: 'Standard' },
      { id: 'h-m2', name: 'Awolowo Hall',      capacity: 150, type: 'Premium' },
      { id: 'h-m3', name: 'Independence Hall', capacity: 300, type: 'Standard' },
      { id: 'h-m4', name: 'Sultan Bello Hall', capacity: 250, type: 'Standard' },
    ],
    female: [
      { id: 'h-f1', name: 'Queen Amina Hall',  capacity: 200, type: 'Standard' },
      { id: 'h-f2', name: 'Moremi Hall',        capacity: 180, type: 'Premium' },
      { id: 'h-f3', name: "Nana Asma'u Hall",  capacity: 220, type: 'Standard' },
      { id: 'h-f4', name: 'Taiwo Hall',         capacity: 160, type: 'Premium' },
    ],
  },
};

/* ── Global State ── */
const state = {
  currentStep: 1,
  selectedLevel: null,   // 'UG' | 'PG'
  currentEvent: {},
  departmentsData: DEPARTMENTS_DATA, // pre-loaded — no fetch needed
  isLoading: false,
};

const CURRENT_YEAR = new Date().getFullYear();
const TOTAL_STEPS  = 2;

/* ════════════════════════════════════════
   MODAL CONTROLS
   ════════════════════════════════════════ */

/**
 * Opens the registration modal for a given event.
 * Resets form state and triggers async data fetch.
 */
function openModal(eventName, eventSub, eventDate, regCount) {
  state.currentEvent = { name: eventName, sub: eventSub, date: eventDate, regCount };

  // Set modal event title
  document.getElementById('modalTitle').textContent = eventName;

  // Reset form fully before opening
  resetForm();

  // Show modal with animation
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Fetch departments data asynchronously
  fetchDepartments();

  showToast('info', '📋', `Registering for ${eventName}`);
}

/** Closes the modal */
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/** Close modal when clicking the backdrop */
function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) {
    closeModal();
  }
}

/** Resets form and reopens for another registration */
function resetAndClose() {
  closeModal();
  setTimeout(resetForm, 400);
}

/* ════════════════════════════════════════
   ASYNC DATA FETCHING
   ════════════════════════════════════════ */

/**
 * Fetches departments.json asynchronously.
 * Uses a skeleton loader while the data is being fetched.
 * Falls back gracefully on error.
 */
async function fetchDepartments() {
  // Data is embedded in DEPARTMENTS_DATA — works with no server needed.
  // Show a brief skeleton loader for UX polish.
  showSkeletonLoader('dept-loader', 'department');
  await new Promise(r => setTimeout(r, 400));
  hideSkeletonLoader('dept-loader', 'department');

  // Optionally try loading from JSON file if served from a server — silent fail if not.
  try {
    const response = await fetch('departments.json');
    if (response.ok) {
      const data = await response.json();
      state.departmentsData = data;
      console.info('[EduEvents] departments.json loaded from server.');
    }
  } catch (_) {
    console.info('[EduEvents] Using embedded departments data (no server required).');
  }

  if (state.selectedLevel) {
    populateDepartmentDropdown(state.selectedLevel);
  }
}

/**
 * Populates the department <select> based on the selected level.
 * Data is sourced from the async-fetched departments.json.
 */
function populateDepartmentDropdown(level) {
  const select = document.getElementById('department');
  const data   = state.departmentsData;

  if (!data) {
    select.innerHTML = '<option value="">— Data unavailable —</option>';
    return;
  }

  const departments = level === 'UG' ? data.undergraduate : data.postgraduate;
  select.innerHTML = '<option value="">— Select Department —</option>';

  // Group by faculty
  const byFaculty = departments.reduce((acc, dept) => {
    const faculty = dept.faculty || 'General';
    if (!acc[faculty]) acc[faculty] = [];
    acc[faculty].push(dept);
    return acc;
  }, {});

  Object.entries(byFaculty).forEach(([faculty, depts]) => {
    const group = document.createElement('optgroup');
    group.label = faculty;
    depts.forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept.id;
      opt.textContent = dept.name;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
}

/**
 * Populates hostel dropdown based on selected gender.
 * Called dynamically when gender changes.
 */
function populateHostelDropdown(gender) {
  const select = document.getElementById('hostelBlock');
  const data   = state.departmentsData;

  if (!data || !data.hostels) {
    select.innerHTML = '<option value="">— No hostel data —</option>';
    return;
  }

  const hostels = gender === 'female' ? data.hostels.female : data.hostels.male;
  select.innerHTML = '<option value="">— Select Hostel —</option>';

  hostels.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h.id;
    opt.textContent = `${h.name} (${h.type} · Capacity: ${h.capacity})`;
    select.appendChild(opt);
  });
}

/* ════════════════════════════════════════
   LEVEL SELECTION
   ════════════════════════════════════════ */

/**
 * Handles UG / PG toggle without page reload.
 * Dynamically updates form hints, dropdowns, and placeholders.
 */
function selectLevel(level) {
  state.selectedLevel = level;

  // Update button states
  const btnUG = document.getElementById('btnUG');
  const btnPG = document.getElementById('btnPG');
  btnUG.classList.toggle('selected', level === 'UG');
  btnPG.classList.toggle('selected', level === 'PG');
  btnUG.setAttribute('aria-pressed', level === 'UG');
  btnPG.setAttribute('aria-pressed', level === 'PG');

  // Clear any level error
  hideError('err-level');

  // Update matric number hints and placeholder
  const matricInput = document.getElementById('matricNo');
  const formatHint  = document.getElementById('matric-format-hint');
  const tooltip     = document.getElementById('matric-tooltip');
  const hintText    = document.getElementById('hint-matric');

  if (level === 'UG') {
    matricInput.placeholder = `e.g. UG${CURRENT_YEAR}1234`;
    formatHint.textContent  = `UG${CURRENT_YEAR}XXXX`;
    tooltip.textContent     = `Format: UG${CURRENT_YEAR}XXXX — starts with UG, current year, 4 unique digits`;
    hintText.innerHTML      = `<i class="fas fa-info-circle"></i> Must start with <strong>UG${CURRENT_YEAR}</strong> followed by 4 digits`;
  } else {
    matricInput.placeholder = `e.g. PG${CURRENT_YEAR}1234`;
    formatHint.textContent  = `PG${CURRENT_YEAR}XXXX`;
    tooltip.textContent     = `Format: PG${CURRENT_YEAR}XXXX — starts with PG, current year, 4 unique digits`;
    hintText.innerHTML      = `<i class="fas fa-info-circle"></i> Must start with <strong>PG${CURRENT_YEAR}</strong> followed by 4 digits`;
  }

  // Update DOB label hint
  const dobHint = document.getElementById('dob-hint');
  dobHint.textContent = level === 'UG' ? 'Must be under 25 years old' : 'Must be at least 22 years old';

  // Refresh matric and DOB validation if already filled
  if (matricInput.value) validateMatricRealtime();
  const dob = document.getElementById('dob');
  if (dob.value) validateDOBRealtime();

  // Populate department dropdown
  populateDepartmentDropdown(level);

  // Update hostel list if gender already selected
  const gender = document.getElementById('gender').value;
  if (gender && gender !== 'prefer-not') {
    populateHostelDropdown(gender);
  }

  showToast('info', level === 'UG' ? '🎓' : '🏛️', `${level === 'UG' ? 'Undergraduate' : 'Postgraduate'} mode activated`);
}

/* ════════════════════════════════════════
   STEP NAVIGATION
   ════════════════════════════════════════ */

function nextStep() {
  if (!validateStep1()) return;

  state.currentStep = 2;
  switchStep(2);

  // Populate hostel based on gender after level is confirmed
  const gender = document.getElementById('gender').value;
  if (state.selectedLevel === 'UG') {
    showSkeletonLoader('hostel-loader', 'hostelBlock');
    setTimeout(() => {
      populateHostelDropdown(gender !== 'prefer-not' ? gender : 'male');
      hideSkeletonLoader('hostel-loader', 'hostelBlock');
    }, 500);
  }
}

function prevStep() {
  state.currentStep = 1;
  switchStep(1);
}

/**
 * Switches between form steps and updates all visual indicators.
 */
function switchStep(step) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`formStep${step}`).classList.add('active');

  // Update step indicators
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const ind = document.getElementById(`step-indicator-${i}`);
    ind.classList.remove('active', 'completed');
    if (i < step) ind.classList.add('completed');
    else if (i === step) ind.classList.add('active');

    // Update circle content
    const circle = ind.querySelector('.step-circle');
    if (i < step) circle.innerHTML = '<i class="fas fa-check"></i>';
    else circle.textContent = i;
  }

  // Update progress bar
  const pct = (step / TOTAL_STEPS) * 100;
  document.getElementById('progressBar').style.width = `${pct}%`;

  // Show correct section in step 2
  if (step === 2) {
    document.getElementById('ug-section').style.display = state.selectedLevel === 'UG' ? 'block' : 'none';
    document.getElementById('pg-section').style.display = state.selectedLevel === 'PG' ? 'block' : 'none';
  }

  // Scroll modal to top
  document.getElementById('registrationModal').scrollTo({ top: 0, behavior: 'smooth' });
}

/* ════════════════════════════════════════
   VALIDATION — STEP 1
   ════════════════════════════════════════ */

function validateStep1() {
  let valid = true;

  // Level selection
  if (!state.selectedLevel) {
    showError('err-level', 'Please select your academic level.');
    valid = false;
  }

  // Matric number
  if (!validateMatric()) valid = false;

  // Full name
  const name = document.getElementById('fullName').value.trim();
  if (!name) {
    showError('err-name', 'Full name is required.');
    setInputState('fullName', 'name-status', false);
    valid = false;
  } else if (name.length < 3) {
    showError('err-name', 'Name must be at least 3 characters long.');
    setInputState('fullName', 'name-status', false);
    valid = false;
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    showError('err-name', 'Name can only contain letters, spaces, hyphens and apostrophes.');
    setInputState('fullName', 'name-status', false);
    valid = false;
  } else {
    hideError('err-name');
    setInputState('fullName', 'name-status', true);
  }

  // Date of Birth
  if (!validateDOB()) valid = false;

  // Email
  const email = document.getElementById('email').value.trim();
  if (!email) {
    showError('err-email', 'Email address is required.');
    setInputState('email', 'email-status', false);
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('err-email', 'Please enter a valid email address.');
    setInputState('email', 'email-status', false);
    valid = false;
  } else {
    hideError('err-email');
    setInputState('email', 'email-status', true);
  }

  // Department
  const dept = document.getElementById('department').value;
  if (!dept) {
    showError('err-dept', 'Please select your department.');
    valid = false;
  } else {
    hideError('err-dept');
  }

  // Phone
  const phone = document.getElementById('phone').value.trim();
  if (!phone) {
    showError('err-phone', 'Phone number is required.');
    setInputState('phone', 'phone-status', false);
    valid = false;
  } else if (!/^(\+?[\d\s\-()]{7,15})$/.test(phone)) {
    showError('err-phone', 'Please enter a valid phone number (7–15 digits).');
    setInputState('phone', 'phone-status', false);
    valid = false;
  } else {
    hideError('err-phone');
    setInputState('phone', 'phone-status', true);
  }

  // Gender
  const gender = document.getElementById('gender').value;
  if (!gender) {
    showError('err-gender', 'Please select your gender.');
    valid = false;
  } else {
    hideError('err-gender');
  }

  if (!valid) {
    showToast('error', '❌', 'Please fix the highlighted errors before continuing.');
  }

  return valid;
}

/* ════════════════════════════════════════
   MATRIC NUMBER VALIDATION
   ════════════════════════════════════════ */

/**
 * Validates matric number against strict format rules:
 * - UG students: UG + CURRENT_YEAR + 4 digits (no repeats)
 * - PG students: PG + CURRENT_YEAR + 4 digits (no repeats)
 */
function validateMatric() {
  const input  = document.getElementById('matricNo');
  const value  = input.value.trim().toUpperCase();
  const level  = state.selectedLevel;

  if (!level) {
    showError('err-matric', 'Please select your academic level first.');
    return false;
  }

  if (!value) {
    showError('err-matric', 'Matric number is required.');
    setInputState('matricNo', 'matric-status', false);
    return false;
  }

  const prefix  = level; // 'UG' or 'PG'
  const pattern = new RegExp(`^${prefix}${CURRENT_YEAR}(\\d{4})$`);
  const match   = value.match(pattern);

  if (!match) {
    showError('err-matric', `Invalid format. Expected: ${prefix}${CURRENT_YEAR}XXXX (e.g. ${prefix}${CURRENT_YEAR}1023)`);
    setInputState('matricNo', 'matric-status', false);
    return false;
  }

  // Check that all 4 digits are unique
  const digits = match[1].split('');
  const unique  = new Set(digits);
  if (unique.size !== 4) {
    showError('err-matric', 'The 4 digits in your matric number must all be unique (e.g. 1234, not 1124).');
    setInputState('matricNo', 'matric-status', false);
    return false;
  }

  hideError('err-matric');
  setInputState('matricNo', 'matric-status', true);
  return true;
}

/** Called on every keystroke for real-time feedback */
function validateMatricRealtime() {
  const input = document.getElementById('matricNo');
  input.value = input.value.toUpperCase(); // auto-uppercase
  if (input.value.length >= 10) validateMatric();
  else {
    hideError('err-matric');
    setInputState('matricNo', 'matric-status', null);
  }
}

/* ════════════════════════════════════════
   DATE OF BIRTH VALIDATION
   ════════════════════════════════════════ */

/**
 * Validates age against academic level rules:
 * - Undergraduate: must be YOUNGER than 25
 * - Postgraduate: must be AT LEAST 22
 */
function validateDOB() {
  const dobInput = document.getElementById('dob');
  const dob      = dobInput.value;
  const level    = state.selectedLevel;

  if (!level) {
    showError('err-dob', 'Please select your academic level before entering date of birth.');
    return false;
  }

  if (!dob) {
    showError('err-dob', 'Date of birth is required.');
    hideElement('ok-dob');
    return false;
  }

  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const birth  = new Date(dob);
  const ageMs  = today - birth;
  const ageDt  = new Date(ageMs);
  const ageYrs = Math.abs(ageDt.getUTCFullYear() - 1970);

  if (birth >= today) {
    showError('err-dob', 'Date of birth cannot be today or a future date.');
    hideElement('ok-dob');
    return false;
  }

  if (level === 'UG') {
    if (ageYrs >= 25) {
      showError('err-dob', `Undergraduate students must be younger than 25 years old. Your age: ${ageYrs} years.`);
      hideElement('ok-dob');
      return false;
    }
  } else {
    if (ageYrs < 22) {
      showError('err-dob', `Postgraduate students must be at least 22 years old. Your age: ${ageYrs} years.`);
      hideElement('ok-dob');
      return false;
    }
  }

  hideError('err-dob');
  showElement('ok-dob', `✓ Age confirmed: ${ageYrs} year${ageYrs !== 1 ? 's' : ''} old — eligible for ${level === 'UG' ? 'Undergraduate' : 'Postgraduate'} registration.`);
  return true;
}

function validateDOBRealtime() {
  if (state.selectedLevel) validateDOB();
}

/* ════════════════════════════════════════
   STEP 2 VALIDATION
   ════════════════════════════════════════ */

function validateStep2() {
  let valid = true;
  const level = state.selectedLevel;

  if (level === 'UG') {
    // Hostel
    const hostel = document.getElementById('hostelBlock').value;
    if (!hostel) {
      showError('err-hostel', 'Please select a hostel preference.');
      valid = false;
    } else {
      hideError('err-hostel');
    }

    // Current level/year
    const yr = document.getElementById('levelYear').value;
    if (!yr) {
      showError('err-level-year', 'Please select your current level.');
      valid = false;
    } else {
      hideError('err-level-year');
    }

  } else if (level === 'PG') {
    // Last institution
    const inst = document.getElementById('lastInstitution').value.trim();
    if (!inst || inst.length < 3) {
      showError('err-institution', 'Please enter the name of your last institution (min. 3 characters).');
      valid = false;
    } else {
      hideError('err-institution');
    }

    // Previous degree
    const deg = document.getElementById('prevDegree').value;
    if (!deg) {
      showError('err-prev-degree', 'Please select your previous degree.');
      valid = false;
    } else {
      hideError('err-prev-degree');
    }

    // Graduation year
    const yr  = parseInt(document.getElementById('gradYear').value);
    const now = new Date().getFullYear();
    if (!yr || yr < 1980 || yr > now) {
      showError('err-grad-year', `Please enter a valid graduation year (1980–${now}).`);
      valid = false;
    } else {
      hideError('err-grad-year');
    }

    // Current programme
    const prog = document.getElementById('pgProgram').value;
    if (!prog) {
      showError('err-pg-program', 'Please select your current programme.');
      valid = false;
    } else {
      hideError('err-pg-program');
    }
  }

  // Terms
  const terms = document.getElementById('termsCheck').checked;
  if (!terms) {
    showError('err-terms', 'You must agree to the Terms & Conditions to proceed.');
    valid = false;
  } else {
    hideError('err-terms');
  }

  return valid;
}

/* ════════════════════════════════════════
   FORM SUBMISSION
   ════════════════════════════════════════ */

function submitForm() {
  if (!validateStep2()) {
    showToast('error', '❌', 'Please fix all errors before submitting.');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  // Simulate API call delay
  setTimeout(() => {
    const regId = generateRegistrationId();
    showSuccessScreen(regId);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
  }, 1800);
}

/** Generates a unique registration ID */
function generateRegistrationId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REG-${ts}-${rand}`;
}

/** Displays the success screen with collected data */
function showSuccessScreen(regId) {
  const level     = state.selectedLevel;
  const name      = document.getElementById('fullName').value.trim();
  const matric    = document.getElementById('matricNo').value.trim().toUpperCase();
  const dept      = document.getElementById('department');
  const deptName  = dept.options[dept.selectedIndex]?.text || '—';
  const eventName = state.currentEvent.name;

  // Build detail rows
  const details = [
    { key: 'Full Name',        val: name },
    { key: 'Matric Number',    val: matric },
    { key: 'Academic Level',   val: level === 'UG' ? 'Undergraduate' : 'Postgraduate' },
    { key: 'Department',       val: deptName },
    { key: 'Event',            val: eventName },
    { key: 'Registered On',   val: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
  ];

  const detailsHtml = details.map(d =>
    `<div class="detail-row">
       <span class="detail-key">${d.key}</span>
       <span class="detail-val">${d.val}</span>
     </div>`
  ).join('');

  document.getElementById('regIdBadge').textContent = regId;
  document.getElementById('successDetails').innerHTML = detailsHtml;

  // Switch to success view
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('successScreen').classList.add('active');

  // Hide step indicators on success
  document.getElementById('stepIndicator').style.display = 'none';
  document.querySelector('.progress-wrap').style.display = 'none';

  showToast('success', '🎉', 'Registration submitted successfully!');

  // Log to console for demo purposes
  console.info('[EduEvents] Registration submitted:', { regId, name, matric, level, deptName, eventName });
}

/* ════════════════════════════════════════
   FORM RESET
   ════════════════════════════════════════ */

function resetForm() {
  // Reset state
  state.currentStep    = 1;
  state.selectedLevel  = null;

  // Reset level buttons
  ['btnUG', 'btnPG'].forEach(id => {
    document.getElementById(id).classList.remove('selected');
    document.getElementById(id).setAttribute('aria-pressed', 'false');
  });

  // Clear all inputs
  ['matricNo', 'fullName', 'dob', 'email', 'phone',
   'lastInstitution', 'gradYear', 'ugNotes', 'researchArea'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Reset all selects
  ['department', 'hostelBlock', 'roomType', 'levelYear',
   'gender', 'prevDegree', 'pgProgram'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });

  // Uncheck terms
  document.getElementById('termsCheck').checked = false;

  // Clear all errors & success states
  document.querySelectorAll('.field-error').forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });
  document.querySelectorAll('.field-success').forEach(el => {
    el.classList.remove('visible');
  });
  document.querySelectorAll('.form-control').forEach(el => {
    el.classList.remove('error', 'success');
  });
  document.querySelectorAll('.input-status').forEach(el => {
    el.className = 'input-status';
    el.textContent = '';
  });

  // Reset char counters
  ['name-count', 'ug-notes-count', 'research-count'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '0';
  });

  // Reset department dropdown
  document.getElementById('department').innerHTML = '<option value="">— Select Academic Level First —</option>';

  // Reset step indicators & progress
  document.getElementById('stepIndicator').style.display = 'flex';
  document.querySelector('.progress-wrap').style.display = 'block';

  // Switch to step 1
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('formStep1').classList.add('active');
  document.getElementById('successScreen').classList.remove('active');

  // Reset step indicators
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const ind = document.getElementById(`step-indicator-${i}`);
    ind.classList.remove('active', 'completed');
    if (i === 1) ind.classList.add('active');
    ind.querySelector('.step-circle').textContent = i;
  }

  document.getElementById('progressBar').style.width = '50%';
}

/* ════════════════════════════════════════
   UTILITY HELPERS
   ════════════════════════════════════════ */

/** Shows an error message under a field */
function showError(errorId, message) {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

/** Hides an error message */
function hideError(errorId) {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('visible');
}

/** Shows a success message */
function showElement(elId, message) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

/** Hides an element */
function hideElement(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.classList.remove('visible');
}

/**
 * Sets visual state (✓/✗) on an input and its wrapper.
 * @param {string} inputId  - The input element ID
 * @param {string} statusId - The status span ID
 * @param {boolean|null} ok - true=success, false=error, null=clear
 */
function setInputState(inputId, statusId, ok) {
  const input  = document.getElementById(inputId);
  const status = document.getElementById(statusId);
  if (!input) return;

  input.classList.remove('error', 'success');
  if (status) {
    status.className = 'input-status';
    status.textContent = '';
  }

  if (ok === true) {
    input.classList.add('success');
    if (status) {
      status.classList.add('show', 'ok');
      status.textContent = '✓';
    }
  } else if (ok === false) {
    input.classList.add('error');
    if (status) {
      status.classList.add('show', 'err');
      status.textContent = '✗';
    }
  }
}

/** Updates a character counter */
function charCount(inputId, counterId, max) {
  const input   = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (!input || !counter) return;
  const len = input.value.length;
  counter.textContent = len;
  counter.style.color = len > max * 0.9 ? 'var(--clr-secondary)' : 'var(--clr-muted)';
}

/** Shows skeleton loader while hiding the actual select */
function showSkeletonLoader(loaderId, selectId) {
  const loader = document.getElementById(loaderId);
  const select = document.getElementById(selectId);
  if (loader) loader.style.display = 'block';
  if (select) select.style.display = 'none';
}

/** Hides skeleton loader and shows the actual select */
function hideSkeletonLoader(loaderId, selectId) {
  const loader = document.getElementById(loaderId);
  const select = document.getElementById(selectId);
  if (loader) loader.style.display = 'none';
  if (select) select.style.display = '';
}

/* ════════════════════════════════════════
   TOAST NOTIFICATIONS
   ════════════════════════════════════════ */

const TOAST_ICONS = { success: '✅', error: '❌', info: 'ℹ️' };

/**
 * Displays a toast notification.
 * @param {'success'|'error'|'info'} type
 * @param {string} icon - Emoji icon
 * @param {string} message
 * @param {number} [duration=3500] - Auto-dismiss delay in ms
 */
function showToast(type, icon, message, duration = 3500) {
  const container = document.getElementById('toastContainer');
  const toast     = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icon}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="dismissToast(this.parentElement)" aria-label="Dismiss notification">✕</button>
  `;
  container.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('out');
  setTimeout(() => toast.remove(), 350);
}

/* ════════════════════════════════════════
   EVENT LISTENERS
   ════════════════════════════════════════ */

// Keyboard: close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Gender change → repopulate hostels
document.getElementById('gender').addEventListener('change', () => {
  if (state.selectedLevel === 'UG' && state.currentStep === 2) {
    const gender = document.getElementById('gender').value;
    populateHostelDropdown(gender !== 'prefer-not' ? gender : 'male');
  }
});

// Allow Enter key on event cards
document.querySelectorAll('.event-card[role="button"]').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// Set max date for DOB (today)
document.getElementById('dob').max = new Date().toISOString().split('T')[0];

console.info('[EduEvents] Script initialized — Ready for registrations!');


/* ═══════════════════════════════════════
   NAVBAR SCROLL & MOBILE TOGGLE
   (appended to existing script.js)
═══════════════════════════════════════ */

// Sticky navbar shadow on scroll
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active link highlighting
  const sections = ['home','about','speakers','schedule','venue','contact'];
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });
  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    });
  });
}

// Scroll reveal animation
const revealEls = document.querySelectorAll('.speaker-card,.sch-item,.contact-card,.about-feat,.vway,.acard-front');
revealEls.forEach(el => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));
