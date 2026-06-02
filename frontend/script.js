// Configuration - Adjust base URL if your backend runs on a different port/host
const API_BASE_URL = "http://127.0.0.1:8000";

// Global Application State
let allStudents = []; // Stores the complete list of students fetched from API
let studentToDeleteId = null; // Tracks which student is currently targeted for deletion

// DOM Elements
const studentsList = document.getElementById("students-list");
const studentCountBadge = document.getElementById("student-count");
const searchInput = document.getElementById("search-input");
const apiStatusBadge = document.getElementById("api-status");

// Theme Toggle DOM Elements
const themeToggleBtn = document.getElementById("theme-toggle");
const sunIcon = themeToggleBtn.querySelector(".sun-icon");
const moonIcon = themeToggleBtn.querySelector(".moon-icon");

// Modal Elements - Form
const studentModal = document.getElementById("student-modal");
const studentForm = document.getElementById("student-form");
const modalTitle = document.getElementById("modal-title");
const studentIdInput = document.getElementById("student-id");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

// Modal Buttons
const btnAddStudent = document.getElementById("btn-add-student");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");

// Modal Elements - Delete
const deleteModal = document.getElementById("delete-modal");
const deleteStudentName = document.getElementById("delete-student-name");
const btnDeleteConfirm = document.getElementById("btn-delete-confirm");
const btnDeleteCancel = document.getElementById("btn-delete-cancel");

// Toast Container
const toastContainer = document.getElementById("toast-container");

/* ==========================================================================
   Theme Management (Light / Dark Mode Toggle)
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    // Check local storage or fallback to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.body.classList.add("dark-theme");
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
    } else {
        document.body.classList.remove("dark-theme");
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
    }
}

themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Animate and toggle icons
    if (isDark) {
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
        showToast("Switched to Dark Mode", "info");
    } else {
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
        showToast("Switched to Light Mode", "info");
    }
});

/* ==========================================================================
   API Status Checking
   ========================================================================== */
async function checkApiConnection() {
    const statusDot = apiStatusBadge.querySelector(".status-dot");
    const statusText = apiStatusBadge.querySelector(".status-text");

    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            statusDot.className = "status-dot online";
            statusText.textContent = "Database Connected";
            return true;
        }
    } catch (error) {
        console.error("API connection failed:", error);
    }
    
    statusDot.className = "status-dot offline";
    statusText.textContent = "Backend Offline";
    return false;
}

/* ==========================================================================
   Data Fetching & Table Rendering
   ========================================================================== */
async function fetchStudents() {
    showLoadingState();
    
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to fetch students");
        }
        
        allStudents = await response.json();
        renderStudents(allStudents);
        updateStatistics();
        checkApiConnection(); // Update connection status
    } catch (error) {
        console.error("Error fetching students:", error);
        showToast(`Could not load students: ${error.message}`, "error");
        showEmptyState();
    }
}

function renderStudents(studentsArray) {
    // Clear dynamic table contents
    const rows = studentsList.querySelectorAll("tr:not(#table-loading):not(#table-empty)");
    rows.forEach(row => row.remove());
    
    // Hide states by default
    document.getElementById("table-loading").classList.add("hidden");
    
    if (studentsArray.length === 0) {
        document.getElementById("table-empty").classList.remove("hidden");
        return;
    }
    
    document.getElementById("table-empty").classList.add("hidden");
    
    // Populate rows with staggered animations
    studentsArray.forEach((student, index) => {
        const tr = document.createElement("tr");
        tr.id = `student-row-${student.id}`;
        tr.classList.add("row-entry");
        // Stagger row entrance delays slightly for dynamic aesthetic effect
        tr.style.animationDelay = `${index * 0.05}s`;
        
        tr.innerHTML = `
            <td><strong>#${student.id}</strong></td>
            <td>${escapeHTML(student.first_name)}</td>
            <td>${escapeHTML(student.last_name)}</td>
            <td><a href="mailto:${student.email}" class="text-secondary" style="text-decoration:none">${escapeHTML(student.email)}</a></td>
            <td>${student.phone ? escapeHTML(student.phone) : '<span class="text-muted">—</span>'}</td>
            <td class="text-center">
                <div class="action-buttons">
                    <button class="btn-action btn-edit" title="Edit Student" onclick="openEditModal(${student.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </button>
                    <button class="btn-action btn-delete" title="Delete Student" onclick="confirmDeleteStudent(${student.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </td>
        `;
        studentsList.appendChild(tr);
    });
}

function updateStatistics() {
    animateCountUp("student-count", allStudents.length);
}

/* ==========================================================================
   Smooth Counter Animation (Count-Up)
   ========================================================================== */
function animateCountUp(targetId, targetValue) {
    const el = document.getElementById(targetId);
    if (!el) return;
    
    const startValue = parseInt(el.textContent) || 0;
    if (startValue === targetValue) {
        el.textContent = targetValue;
        return;
    }

    const duration = 600; // Animation duration in milliseconds
    const startTime = performance.now();
    
    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutQuad)
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(startValue + easeProgress * (targetValue - startValue));
        
        el.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            el.textContent = targetValue;
        }
    }
    requestAnimationFrame(updateCount);
}

function showLoadingState() {
    // Clear rows
    const rows = studentsList.querySelectorAll("tr:not(#table-loading):not(#table-empty)");
    rows.forEach(row => row.remove());
    
    document.getElementById("table-loading").classList.remove("hidden");
    document.getElementById("table-empty").classList.add("hidden");
}

function showEmptyState() {
    document.getElementById("table-loading").classList.add("hidden");
    document.getElementById("table-empty").classList.remove("hidden");
}

/* ==========================================================================
   Search Functionality (Local In-Memory Filter)
   ========================================================================== */
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === "") {
        renderStudents(allStudents);
        return;
    }
    
    const filtered = allStudents.filter(student => {
        return (
            student.first_name.toLowerCase().includes(query) ||
            student.last_name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query) ||
            (student.phone && student.phone.toLowerCase().includes(query)) ||
            student.id.toString().includes(query)
        );
    });
    
    renderStudents(filtered);
});

/* ==========================================================================
   Add / Edit Modal Behavior
   ========================================================================== */
btnAddStudent.addEventListener("click", () => {
    openAddModal();
});

modalCloseBtn.addEventListener("click", closeFormModal);
modalCancelBtn.addEventListener("click", closeFormModal);

// Close modal if user clicks outside the modal card
window.addEventListener("click", (e) => {
    if (e.target === studentModal) {
        closeFormModal();
    }
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

function openAddModal() {
    studentForm.reset();
    studentIdInput.value = "";
    modalTitle.textContent = "Add Student";
    document.getElementById("modal-submit-btn").textContent = "Save Student";
    studentModal.classList.add("show");
}

function openEditModal(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) {
        showToast("Student details not found", "error");
        return;
    }
    
    // Prefill form
    studentIdInput.value = student.id;
    firstNameInput.value = student.first_name;
    lastNameInput.value = student.last_name;
    emailInput.value = student.email;
    phoneInput.value = student.phone || "";
    
    // Set headers
    modalTitle.textContent = "Edit Student Details";
    document.getElementById("modal-submit-btn").textContent = "Update Details";
    studentModal.classList.add("show");
}

function closeFormModal() {
    studentModal.classList.remove("show");
}

/* ==========================================================================
   Form Submission (Create / Update APIs)
   ========================================================================== */
studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = studentIdInput.value;
    const isEdit = id !== "";
    
    // Gather form values
    const payload = {
        first_name: firstNameInput.value.trim(),
        last_name: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim() || null
    };
    
    const url = isEdit ? `${API_BASE_URL}/students/${id}` : `${API_BASE_URL}/students`;
    const method = isEdit ? "PUT" : "POST";
    
    // Disable submit button during fetch
    const submitBtn = document.getElementById("modal-submit-btn");
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || "Server request failed");
        }
        
        showToast(
            isEdit ? "Student updated successfully!" : "Student registered successfully!",
            "success"
        );
        
        closeFormModal();
        fetchStudents(); // Reload table data
    } catch (error) {
        console.error("Form submission failed:", error);
        showToast(error.message, "error");
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});

/* ==========================================================================
   Delete Confirmation & Action (Delete API)
   ========================================================================== */
btnDeleteCancel.addEventListener("click", closeDeleteModal);

function confirmDeleteStudent(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) {
        showToast("Student details not found", "error");
        return;
    }
    
    studentToDeleteId = student.id;
    deleteStudentName.textContent = `${student.first_name} ${student.last_name}`;
    deleteModal.classList.add("show");
}

function closeDeleteModal() {
    deleteModal.classList.remove("show");
    studentToDeleteId = null;
}

btnDeleteConfirm.addEventListener("click", async () => {
    if (!studentToDeleteId) return;
    
    btnDeleteConfirm.disabled = true;
    btnDeleteConfirm.textContent = "Deleting...";

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentToDeleteId}`, {
            method: "DELETE"
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || "Could not delete student");
        }
        
        showToast("Student record removed successfully.", "success");
        closeDeleteModal();
        fetchStudents(); // Refresh student table
    } catch (error) {
        console.error("Deletion failed:", error);
        showToast(error.message, "error");
    } finally {
        btnDeleteConfirm.disabled = false;
        btnDeleteConfirm.textContent = "Yes, Delete";
    }
});

/* ==========================================================================
   Toast Notifications System
   ========================================================================== */
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    // Choose appropriate SVG icon for toast type
    let iconSvg = "";
    if (type === "success") {
        iconSvg = `
            <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.748-5.25z" clip-rule="evenodd" />
            </svg>
        `;
    } else if (type === "error") {
        iconSvg = `
            <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
            </svg>
        `;
    } else {
        iconSvg = `
            <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
            </svg>
        `;
    }
    
    toast.innerHTML = `
        ${iconSvg}
        <span class="toast-message">${escapeHTML(message)}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
        toast.classList.add("removing");
        toast.addEventListener("transitionend", () => {
            toast.remove();
        });
    }, 4000);
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */
function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Initial theme check
    initTheme();
    
    // Initial fetch of students
    fetchStudents();
    
    // Verify connection status every 15 seconds
    setInterval(checkApiConnection, 15000);
});
