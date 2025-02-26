/**
 * Invoice Pro - Professional Invoice Generator
 * A modern, customizable invoice generator with enhanced features
 * 
 * Features:
 * - Create and manage professional invoices
 * - Track service hours and calculate totals
 * - Support for taxes and discounts
 * - Customizable themes and styles
 * - Print-ready invoice generation
 * - Export to PDF (using browser's built-in PDF export)
 * - Local storage for data persistence
 */

/**
 * Initialize application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

/**
 * Initialize the application
 * Sets up event listeners and loads saved data
 */
function initApp() {
    try {
        console.log('Initializing application...');
        
        // Set up financial field event listeners
        document.getElementById('hourlyRate').addEventListener('input', function() {
            updateDisplayHourlyRate();
            calculateTotals();
        });
        document.getElementById('taxRate').addEventListener('input', calculateTotals);
        document.getElementById('discountType').addEventListener('change', calculateTotals);
        document.getElementById('discountValue').addEventListener('input', calculateTotals);
        
        // Set up button event listeners - Fix for Add Service button
        const addServiceBtn = document.getElementById('addServiceBtn');
        if (addServiceBtn) {
            console.log('Setting up Add Service button listener');
            addServiceBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Add Service button clicked');
                addService();
            });
        } else {
            console.error('Add Service button not found');
        }
        
        document.getElementById('printBtn').addEventListener('click', printInvoice);
        document.getElementById('exportPdfBtn').addEventListener('click', openPdfInstructions);
        document.getElementById('saveBtn').addEventListener('click', saveInvoice);
        document.getElementById('clearBtn').addEventListener('click', clearInvoice);
        document.getElementById('styleBtn').addEventListener('click', openStyleModal);
        document.getElementById('closeStyleBtn').addEventListener('click', closeStyleModal);
        document.getElementById('applyStylesBtn').addEventListener('click', applyStyles);
        document.getElementById('resetStylesBtn').addEventListener('click', resetStyles);
        document.getElementById('confirmServicesBtn').addEventListener('click', confirmAllServices);
        
        // Error modal buttons
        document.getElementById('closeErrorBtn').addEventListener('click', closeErrorModal);
        document.getElementById('closeErrorModalBtn').addEventListener('click', closeErrorModal);
        
        // PDF Instructions Modal listeners
        document.getElementById('closePdfInstructionsBtn').addEventListener('click', closePdfInstructions);
        document.getElementById('cancelPdfBtn').addEventListener('click', closePdfInstructions);
        document.getElementById('continueToPdfBtn').addEventListener('click', exportToPdf);
        
        // Date input listeners
        document.getElementById('invoiceDate').addEventListener('change', function() {
            updateDueDateAndDateRange();
            updatePrintDates();
        });
        document.getElementById('dueDate').addEventListener('change', function() {
            validateDates();
            updatePrintDates();
        });
        
        // Theme mode listener
        document.getElementById('themeMode').addEventListener('change', function() {
            toggleDarkMode(this.value === 'dark');
        });
        
        // Editable field listeners
        document.querySelectorAll('.editable').forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
                saveInvoiceData();
            });
        });
        
        // Text area listeners
        document.getElementById('notesContent').addEventListener('input', saveInvoiceData);
        
        // Load saved data
        loadInvoiceData();
        loadSavedStyles();
        
        // Add a service item if none exist
        const serviceItems = document.querySelectorAll('.service-item');
        console.log(`Found ${serviceItems.length} existing service items`);
        if (serviceItems.length === 0) {
            console.log('Adding initial service item');
            addService();
        }
        
        // Set default dates if not already set
        if (!document.getElementById('invoiceDate').value) {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('invoiceDate').value = today;
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
        }
        
        // Calculate initial totals
        calculateTotals();
        updateDisplayHourlyRate();
        updatePrintDates();
        
        // Show welcome message
        showToast('Invoice system initialized. Ready to create your invoice!', 'info');
        console.log('Application initialization complete');
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Error initializing application', 'error');
    }
}

/**
 * Update print-specific date displays
 * Ensures dates show properly in print version
 */
function updatePrintDates() {
    try {
        const invoiceDate = document.getElementById('invoiceDate').value;
        const dueDate = document.getElementById('dueDate').value;
        
        if (invoiceDate) {
            const formattedInvoiceDate = formatDateForDisplay(invoiceDate);
            document.getElementById('printInvoiceDate').textContent = formattedInvoiceDate;
        }
        
        if (dueDate) {
            const formattedDueDate = formatDateForDisplay(dueDate);
            document.getElementById('printDueDate').textContent = formattedDueDate;
        }
    } catch (error) {
        console.error('Error updating print dates:', error);
    }
}

/**
 * Format a date string for display
 * 
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Add a new service item to the service list
 * 
 * @returns {HTMLElement} The newly created service item
 */
function addService() {
    try {
        console.log('Adding new service item');
        const serviceList = document.getElementById('serviceList');
        if (!serviceList) {
            console.error('Service list container not found');
            showToast('Error: Service list container not found', 'error');
            return null;
        }
        
        const newService = document.createElement('div');
        newService.className = 'service-item';
        newService.innerHTML = `
            <input type="text" class="service-field service-description" placeholder="Service Description" required>
            <input type="date" class="service-field" required>
            <input type="number" class="service-field" placeholder="Hours" min="0.1" step="0.1" required>
            <select class="service-field">
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="consulting">Consulting</option>
                <option value="support">Support</option>
                <option value="other">Other</option>
            </select>
            <div class="service-actions">
                <button type="button" class="btn-icon btn-confirm confirm-btn" title="Confirm Service">✓</button>
                <button type="button" class="btn-icon btn-edit edit-btn" title="Edit Service">✎</button>
                <button type="button" class="btn-icon btn-delete delete-btn" title="Delete Service">✕</button>
            </div>
        `;
        
        serviceList.appendChild(newService);
        console.log('Service item added to DOM');
        
        // Set up event listeners for the new service item
        setupServiceListeners(newService);
        
        // Focus on the description field
        setTimeout(() => {
            const descField = newService.querySelector('.service-description');
            if (descField) {
                descField.focus();
            }
        }, 0);
        
        return newService;
    } catch (error) {
        console.error('Error adding service:', error);
        showToast('Error adding service item', 'error');
        return null;
    }
}

/**
 * Set up event listeners for a service item
 * 
 * @param {HTMLElement} serviceItem - The service item element
 */
function setupServiceListeners(serviceItem) {
    try {
        console.log('Setting up service item listeners');
        const inputs = serviceItem.querySelectorAll('input, select');
        const confirmBtn = serviceItem.querySelector('.confirm-btn');
        const editBtn = serviceItem.querySelector('.edit-btn');
        const deleteBtn = serviceItem.querySelector('.delete-btn');
        
        if (!confirmBtn || !editBtn || !deleteBtn) {
            console.error('Service item buttons not found');
            return;
        }
        
        // Input change listeners
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                updateServicePrintData(serviceItem);
                calculateTotals();
                saveInvoiceData();
            });
            
            // Enter key to confirm
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmService(serviceItem);
                }
            });
        });
        
        // Button listeners
        confirmBtn.addEventListener('click', function() {
            console.log('Confirm button clicked');
            confirmService(serviceItem);
        });
        
        editBtn.addEventListener('click', function() {
            console.log('Edit button clicked');
            editService(serviceItem);
        });
        
        deleteBtn.addEventListener('click', function() {
            console.log('Delete button clicked');
            deleteService(serviceItem);
        });
        
        console.log('Service item listeners set up successfully');
    } catch (error) {
        console.error('Error setting up service listeners:', error);
    }
}

/**
 * Confirm all service entries
 * Validates and confirms all valid services, removes any incomplete ones
 */
function confirmAllServices() {
    try {
        console.log('Confirming all services');
        const serviceItems = document.querySelectorAll('.service-item');
        
        if (serviceItems.length === 0) {
            showToast('No services to confirm. Please add at least one service.', 'warning');
            return;
        }
        
        let incompleteCount = 0;
        let confirmedCount = 0;
        
        // Process each service item
        serviceItems.forEach(item => {
            // Skip already confirmed items
            if (item.classList.contains('confirmed')) {
                confirmedCount++;
                return;
            }
            
            // Check if all required fields are filled
            const descriptionElement = item.querySelector('.service-description');
            const dateElement = item.querySelector('input[type="date"]');
            const hoursElement = item.querySelector('input[type="number"]');
            
            const isComplete = 
                descriptionElement && descriptionElement.value && 
                dateElement && dateElement.value && 
                hoursElement && hoursElement.value;
            
            if (isComplete) {
                // If all fields are completed, confirm the service
                confirmService(item);
                confirmedCount++;
            } else {
                // Mark for removal
                item.setAttribute('data-remove', 'true');
                incompleteCount++;
            }
        });
        
        // Remove incomplete items
        document.querySelectorAll('.service-item[data-remove="true"]').forEach(item => {
            item.remove();
        });
        
        // After removal, check if we need to add a new service
        if (document.querySelectorAll('.service-item').length === 0) {
            addService();
            showToast('All incomplete services were removed. Please add at least one service.', 'warning');
            return;
        }
        
        // Show appropriate message
        if (incompleteCount > 0) {
            showToast(`Confirmed ${confirmedCount} services and removed ${incompleteCount} incomplete services.`, 'info');
        } else if (confirmedCount > 0) {
            showToast(`All ${confirmedCount} services confirmed successfully.`, 'success');
        }
        
        // Recalculate totals
        calculateTotals();
    } catch (error) {
        console.error('Error confirming all services:', error);
        showToast('Error confirming services', 'error');
    }
}

/**
 * Confirm a service entry
 * Validates inputs and locks the service item once confirmed
 * 
 * @param {HTMLElement} serviceItem - The service item to confirm
 */
function confirmService(serviceItem) {
    try {
        console.log('Confirming service item');
        const inputs = serviceItem.querySelectorAll('input, select');
        let isValid = true;
        
        // Validate all inputs
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.classList.add('error');
                isValid = false;
                
                // Add error message if not already present
                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = input.validationMessage || 'This field is required';
                    input.insertAdjacentElement('afterend', errorMsg);
                }
            } else {
                input.classList.remove('error');
                if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-message')) {
                    input.nextElementSibling.remove();
                }
            }
        });
        
        if (isValid) {
            // Make inputs readonly
            inputs.forEach(input => {
                input.setAttribute('readonly', true);
                input.style.borderColor = 'transparent';
            });
            
            // Update UI state
            serviceItem.classList.add('confirmed');
            
            // Update service data and save
            updateServicePrintData(serviceItem);
            calculateTotals();
            saveInvoiceData();
            
            showToast('Service confirmed successfully', 'success');
            
            // Check if we need to add a new service item
            const allConfirmed = Array.from(document.querySelectorAll('.service-item')).every(
                item => item.classList.contains('confirmed')
            );
            
            if (allConfirmed) {
                console.log('All services confirmed, adding a new one');
                addService();
            }
        } else {
            showToast('Please fill in all service details correctly', 'error');
        }
    } catch (error) {
        console.error('Error confirming service:', error);
        showToast('Error confirming service', 'error');
    }
}

/**
 * Edit a previously confirmed service
 * Makes the service item editable again
 * 
 * @param {HTMLElement} serviceItem - The service item to edit
 */
function editService(serviceItem) {
    try {
        console.log('Editing service item');
        // Remove confirmed state
        serviceItem.classList.remove('confirmed');
        
        // Make inputs editable again
        const inputs = serviceItem.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.style.borderColor = '';
        });
        
        // Focus on the first input
        const firstInput = inputs[0];
        if (firstInput) {
            firstInput.focus();
        }
        
        showToast('Editing service item', 'info');
    } catch (error) {
        console.error('Error editing service:', error);
        showToast('Error editing service', 'error');
    }
}

/**
 * Delete a service item
 * Prompts for confirmation before removing
 * 
 * @param {HTMLElement} serviceItem - The service item to delete
 */
function deleteService(serviceItem) {
    try {
        console.log('Deleting service item');
        const description = serviceItem.querySelector('.service-description')?.value || '';
        const confirmMessage = description ? 
            `Are you sure you want to delete "${description}"?` : 
            'Are you sure you want to delete this service?';
            
        if (confirm(confirmMessage)) {
            // Animate removal
            serviceItem.style.opacity = '0';
            serviceItem.style.transform = 'translateY(20px)';
            serviceItem.style.transition = 'opacity 0.3s, transform 0.3s';
            
            setTimeout(() => {
                serviceItem.remove();
                calculateTotals();
                saveInvoiceData();
                
                // Add a new service if this was the last one
                const remainingServices = document.querySelectorAll('.service-item');
                if (remainingServices.length === 0) {
                    console.log('No services left, adding a new one');
                    addService();
                }
                
                showToast('Service removed', 'info');
            }, 300);
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        showToast('Error deleting service', 'error');
    }
}

/**
 * Update service item's print data
 * Creates a formatted version for printing
 * 
 * @param {HTMLElement} serviceItem - The service item to update
 */
function updateServicePrintData(serviceItem) {
    try {
        const descriptionElement = serviceItem.querySelector('.service-description');
        const dateElement = serviceItem.querySelector('input[type="date"]');
        const hoursElement = serviceItem.querySelector('input[type="number"]');
        const categoryElement = serviceItem.querySelector('select');
        
        if (!descriptionElement || !dateElement || !hoursElement || !categoryElement) {
            console.error('Service item elements not found');
            return;
        }
        
        const description = descriptionElement.value;
        const date = dateElement.value;
        const hours = hoursElement.value;
        const category = categoryElement.value;
        
        // Don't create print content for incomplete items
        if (!description || !date || !hours) {
            serviceItem.setAttribute('data-print-empty', 'true');
            return;
        }
        
        // Format date for display
        const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : '';
        
        // Create print content with single-line format
        const printContent = `
            <div class="print-service-row">
                <div class="print-service-description">${description}</div>
                <div class="print-service-details">
                    <div class="print-service-date">${formattedDate}</div>
                    <div class="print-service-category">${category}</div>
                    <div class="print-service-hours">${hours} hrs</div>
                </div>
            </div>
        `;
        
        serviceItem.setAttribute('data-print', printContent);
        serviceItem.setAttribute('data-print-empty', 'false');
    } catch (error) {
        console.error('Error updating service print data:', error);
    }
}
/**
 * Update the displayed hourly rate
 * Keeps the visible rate in sync with the input
 */
function updateDisplayHourlyRate() {
    try {
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
        document.getElementById('displayHourlyRate').textContent = hourlyRate.toFixed(2);
    } catch (error) {
        console.error('Error updating hourly rate display:', error);
    }
}

/**
 * Calculate all financial totals
 * Computes hours, subtotal, tax, discount and final total
 */
function calculateTotals() {
    try {
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
        let totalHours = 0;
        let minDate = null;
        let maxDate = null;
        
        // Calculate total hours and date range
        document.querySelectorAll('.service-item').forEach(item => {
            const hours = parseFloat(item.querySelector('input[type="number"]')?.value) || 0;
            const date = item.querySelector('input[type="date"]')?.value;
            
            totalHours += hours;
            
            if (date) {
                const currentDate = new Date(date);
                if (!minDate || currentDate < minDate) minDate = currentDate;
                if (!maxDate || currentDate > maxDate) maxDate = currentDate;
            }
        });
        
        // Calculate financial values
        const subtotal = totalHours * hourlyRate;
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        
        // Calculate discount
        const discountType = document.getElementById('discountType').value;
        const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
        let discountAmount = 0;
        
        if (discountType === 'percentage') {
            discountAmount = subtotal * (discountValue / 100);
        } else if (discountType === 'fixed') {
            discountAmount = discountValue;
        }
        
        // Calculate total
        const total = subtotal + taxAmount - discountAmount;
        
        // Update DOM
        document.getElementById('totalHours').textContent = totalHours.toFixed(2);
        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
        document.getElementById('discountAmount').textContent = formatCurrency(discountAmount);
        document.getElementById('total').textContent = formatCurrency(total);
        
        // Update date range
        if (minDate && maxDate) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const dateRange = `${minDate.toLocaleDateString(undefined, options)} - ${maxDate.toLocaleDateString(undefined, options)}`;
            document.getElementById('invoiceDateRange').textContent = dateRange;
        } else {
            document.getElementById('invoiceDateRange').textContent = 'Not set';
        }
    } catch (error) {
        console.error('Error calculating totals:', error);
        showToast('Error calculating invoice totals', 'error');
    }
}

/**
 * Format currency value
 * 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

/**
 * Update due date based on invoice date
 * Sets due date to 30 days after invoice date by default
 */
function updateDueDateAndDateRange() {
    try {
        // Only update due date if user hasn't manually set it yet
        if (!document.getElementById('dueDate').value) {
            const invoiceDate = new Date(document.getElementById('invoiceDate').value);
            if (!isNaN(invoiceDate.getTime())) {
                const dueDate = new Date(invoiceDate);
                dueDate.setDate(dueDate.getDate() + 30);
                document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
            }
        }
        
        validateDates();
        saveInvoiceData();
    } catch (error) {
        console.error('Error updating due date:', error);
    }
}

/**
 * Validate date fields
 * Ensures due date is after invoice date
 * 
 * @returns {boolean} True if dates are valid
 */
function validateDates() {
    try {
        const invoiceDate = new Date(document.getElementById('invoiceDate').value);
        const dueDate = new Date(document.getElementById('dueDate').value);
        
        if (!isNaN(invoiceDate.getTime()) && !isNaN(dueDate.getTime())) {
            if (dueDate < invoiceDate) {
                document.getElementById('dueDate').classList.add('error');
                
                // Add error message if not already present
                const dueDateElement = document.getElementById('dueDate');
                if (!dueDateElement.nextElementSibling || 
                    !dueDateElement.nextElementSibling.classList.contains('error-message')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'Due date must be after invoice date';
                    dueDateElement.insertAdjacentElement('afterend', errorMsg);
                }
                
                return false;
            } else {
                document.getElementById('dueDate').classList.remove('error');
                const dueDateElement = document.getElementById('dueDate');
                if (dueDateElement.nextElementSibling && 
                    dueDateElement.nextElementSibling.classList.contains('error-message')) {
                    dueDateElement.nextElementSibling.remove();
                }
                
                return true;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error validating dates:', error);
        return false;
    }
}

/**
 * Validate a field
 * Checks for required fields and proper formats
 * 
 * @param {HTMLElement} field - The field to validate
 * @returns {boolean} True if field is valid
 */
function validateField(field) {
    try {
        field.classList.remove('error');
        
        // Remove existing error message
        const errorMsg = field.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
        }
        
        // Check for required fields
        if (field.getAttribute('data-required') === 'true' && field.textContent.trim() === '') {
            field.classList.add('error');
            field.insertAdjacentHTML('afterend', '<div class="error-message">This field is required.</div>');
            return false;
        }
        
        // Validate email fields
        if (field.id === 'email' && !isValidEmail(field.textContent)) {
            field.classList.add('error');
            field.insertAdjacentHTML('afterend', '<div class="error-message">Please enter a valid email address.</div>');
            return false;
        } else if (field.id === 'clientEmail' && field.textContent.trim() !== '' && !isValidEmail(field.textContent)) {
            field.classList.add('error');
            field.insertAdjacentHTML('afterend', '<div class="error-message">Please enter a valid email address.</div>');
            return false;
        }
        
        // Validate phone numbers
        if ((field.id === 'phone' || field.id === 'clientPhone') && 
            field.textContent.trim() !== '' && !isValidPhone(field.textContent)) {
            field.classList.add('error');
            field.insertAdjacentHTML('afterend', '<div class="error-message">Please enter a valid phone number.</div>');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error validating field:', error);
        return false;
    }
}

/**
 * Validate all fields before saving/printing
 * 
 * @param {boolean} showErrorModal - Whether to show the error modal for validation failures
 * @returns {boolean} True if all validations pass
 */
function validateAllFields(showErrorModal = true) {
    try {
        let isValid = true;
        const errors = [];
        
        // Remove any existing error highlights
        document.querySelectorAll('.error-highlight').forEach(el => {
            el.classList.remove('error-highlight');
        });
        
        // Check editable fields
        document.querySelectorAll('.editable[data-required="true"]').forEach(field => {
            if (field.textContent.trim() === '') {
                field.classList.add('error');
                field.classList.add('error-highlight');
                
                const fieldName = field.id;
                const fieldLabel = getFieldLabel(fieldName);
                errors.push({
                    field: field,
                    message: `${fieldLabel} is required.`,
                    type: 'missing'
                });
                
                isValid = false;
            } else {
                field.classList.remove('error');
                
                // Validate email fields
                if (field.id === 'email' && !isValidEmail(field.textContent)) {
                    field.classList.add('error');
                    field.classList.add('error-highlight');
                    errors.push({
                        field: field,
                        message: 'Business Email must be a valid email address.',
                        type: 'invalid'
                    });
                    isValid = false;
                } else if (field.id === 'clientEmail' && field.textContent.trim() !== '' && !isValidEmail(field.textContent)) {
                    field.classList.add('error');
                    field.classList.add('error-highlight');
                    errors.push({
                        field: field,
                        message: 'Client Email must be a valid email address.',
                        type: 'invalid'
                    });
                    isValid = false;
                }
                
                // Validate phone numbers
                if ((field.id === 'phone' || field.id === 'clientPhone') && 
                    field.textContent.trim() !== '' && !isValidPhone(field.textContent)) {
                    field.classList.add('error');
                    field.classList.add('error-highlight');
                    errors.push({
                        field: field,
                        message: `${getFieldLabel(field.id)} must be a valid phone number.`,
                        type: 'invalid'
                    });
                    isValid = false;
                }
            }
        });
        
        // Check dates
        const invoiceDateElement = document.getElementById('invoiceDate');
        const dueDateElement = document.getElementById('dueDate');
        
        if (!invoiceDateElement.value) {
            invoiceDateElement.classList.add('error');
            invoiceDateElement.classList.add('error-highlight');
            errors.push({
                field: invoiceDateElement,
                message: 'Invoice Date is required.',
                type: 'missing'
            });
            isValid = false;
        }
        
        if (!dueDateElement.value) {
            dueDateElement.classList.add('error');
            dueDateElement.classList.add('error-highlight');
            errors.push({
                field: dueDateElement,
                message: 'Due Date is required.',
                type: 'missing'
            });
            isValid = false;
        }
        
        // Check if due date is after invoice date
        if (invoiceDateElement.value && dueDateElement.value) {
            const invoiceDate = new Date(invoiceDateElement.value);
            const dueDate = new Date(dueDateElement.value);
            
            if (dueDate < invoiceDate) {
                dueDateElement.classList.add('error');
                dueDateElement.classList.add('error-highlight');
                errors.push({
                    field: dueDateElement,
                    message: 'Due Date must be after Invoice Date.',
                    type: 'invalid'
                });
                isValid = false;
            }
        }
        
        // Check services
        const services = document.querySelectorAll('.service-item');
        if (services.length === 0) {
            const serviceSection = document.querySelector('.services-section');
            serviceSection.classList.add('error-highlight');
            errors.push({
                field: serviceSection,
                message: 'At least one service is required.',
                type: 'missing'
            });
            isValid = false;
        } else {
            // Check if all services are confirmed
            const allConfirmed = Array.from(services).every(item => 
                item.classList.contains('confirmed')
            );
            
            if (!allConfirmed) {
                const serviceSection = document.querySelector('.services-section');
                serviceSection.classList.add('error-highlight');
                errors.push({
                    field: serviceSection,
                    message: 'All services must be confirmed using the "Confirm Services" button.',
                    type: 'unconfirmed'
                });
                isValid = false;
            }
        }
        
        // Check hourly rate
        const hourlyRateElement = document.getElementById('hourlyRate');
        if (parseFloat(hourlyRateElement.value) <= 0) {
            hourlyRateElement.classList.add('error');
            hourlyRateElement.classList.add('error-highlight');
            errors.push({
                field: hourlyRateElement,
                message: 'Hourly Rate must be greater than zero.',
                type: 'invalid'
            });
            isValid = false;
        }
        
        // Show error modal if validation failed and modal display is requested
        if (!isValid && showErrorModal) {
            showErrorModal(errors);
        }
        
        return isValid;
    } catch (error) {
        console.error('Error validating all fields:', error);
        showToast('Error validating form data', 'error');
        return false;
    }
}

/**
 * Get a human-readable label for a field
 * 
 * @param {string} fieldId - The field ID
 * @returns {string} Human-readable field label
 */
function getFieldLabel(fieldId) {
    const labels = {
        'bizName': 'Business Name',
        'businessType': 'Business Type',
        'address': 'Business Address',
        'phone': 'Business Phone',
        'email': 'Business Email',
        'clientName': 'Client Name',
        'clientAddress': 'Client Address',
        'clientPhone': 'Client Phone',
        'clientEmail': 'Client Email',
        'invoiceNumber': 'Invoice Number',
        'invoiceDate': 'Invoice Date',
        'dueDate': 'Due Date',
        'hourlyRate': 'Hourly Rate'
    };
    
    return labels[fieldId] || fieldId;
}

/**
 * Show the error modal with validation errors
 * 
 * @param {Array} errors - Array of validation errors
 */
function showErrorModal(errors) {
    try {
        const errorList = document.getElementById('errorList');
        errorList.innerHTML = '';
        
        // Create list items for each error
        errors.forEach(error => {
            const li = document.createElement('li');
            
            // Create icon
            const icon = document.createElement('span');
            icon.className = 'error-list-icon';
            
            switch(error.type) {
                case 'missing':
                    icon.innerHTML = '⚠️';
                    break;
                case 'invalid':
                    icon.innerHTML = '❌';
                    break;
                case 'unconfirmed':
                    icon.innerHTML = '🔄';
                    break;
                default:
                    icon.innerHTML = '❗';
            }
            
            // Create message
            const message = document.createElement('span');
            message.className = 'error-list-message';
            message.textContent = error.message;
            
            // Create action button
            const action = document.createElement('span');
            action.className = 'error-list-action';
            action.textContent = 'Fix';
            action.addEventListener('click', () => {
                closeErrorModal();
                scrollToField(error.field);
                
                // If it's a field that can receive focus, give it focus
                if (error.field.tagName === 'INPUT' || error.field.tagName === 'SELECT' || error.field.tagName === 'TEXTAREA') {
                    error.field.focus();
                } else if (error.field.hasAttribute('contenteditable')) {
                    error.field.focus();
                }
                
                // For specific error types, take appropriate action
                if (error.type === 'unconfirmed') {
                    // Highlight the confirm services button
                    const confirmBtn = document.getElementById('confirmServicesBtn');
                    confirmBtn.classList.add('error-highlight');
                    setTimeout(() => {
                        confirmBtn.classList.remove('error-highlight');
                    }, 3000);
                }
            });
            
            li.appendChild(icon);
            li.appendChild(message);
            li.appendChild(action);
            errorList.appendChild(li);
        });
        
        // Show the modal
        const errorModal = document.getElementById('errorModal');
        errorModal.style.display = 'flex';
        
        // Animate opening
        setTimeout(() => {
            errorModal.classList.add('visible');
        }, 10);
    } catch (error) {
        console.error('Error showing error modal:', error);
        showToast('Validation failed. Please check required fields.', 'error');
    }
}

/**
 * Close the error modal
 */
function closeErrorModal() {
    try {
        const errorModal = document.getElementById('errorModal');
        errorModal.classList.remove('visible');
        
        // Delay actual hiding for transition
        setTimeout(() => {
            errorModal.style.display = 'none';
        }, 300);
    } catch (error) {
        console.error('Error closing error modal:', error);
    }
}

/**
 * Scroll to a field and apply focus highlighting
 * 
 * @param {HTMLElement} field - The field to scroll to
 */
function scrollToField(field) {
    try {
        // Ensure the field has error-highlight class
        field.classList.add('error-highlight');
        
        // Scroll the field into view
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Create and show tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'error-tooltip';
        tooltip.textContent = 'Please fix this field';
        
        // Position the tooltip
        const rect = field.getBoundingClientRect();
        tooltip.style.top = `${window.scrollY + rect.top - 40}px`;
        tooltip.style.left = `${window.scrollX + rect.left}px`;
        
        document.body.appendChild(tooltip);
        
        // Remove the tooltip after a delay
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
        
        // Highlight the field again after a delay (to make it pulse twice)
        setTimeout(() => {
            field.classList.remove('error-highlight');
            setTimeout(() => {
                field.classList.add('error-highlight');
                setTimeout(() => {
                    field.classList.remove('error-highlight');
                }, 2000);
            }, 100);
        }, 1500);
    } catch (error) {
        console.error('Error scrolling to field:', error);
    }
}

/**
 * Check if email is valid
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(email.trim());
}

/**
 * Check if phone number is valid
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
function isValidPhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone.trim());
}

/**
 * Save invoice data to localStorage
 * Persists all current invoice data
 */
function saveInvoiceData() {
    try {
        const bizNameElement = document.getElementById('bizName');
        const businessTypeElement = document.getElementById('businessType');
        const addressElement = document.getElementById('address');
        const phoneElement = document.getElementById('phone');
        const emailElement = document.getElementById('email');
        const clientNameElement = document.getElementById('clientName');
        const clientAddressElement = document.getElementById('clientAddress');
        const clientPhoneElement = document.getElementById('clientPhone');
        const clientEmailElement = document.getElementById('clientEmail');
        const invoiceNumberElement = document.getElementById('invoiceNumber');
        const invoiceDateElement = document.getElementById('invoiceDate');
        const dueDateElement = document.getElementById('dueDate');
        const invoiceDateRangeElement = document.getElementById('invoiceDateRange');
        const hourlyRateElement = document.getElementById('hourlyRate');
        const taxRateElement = document.getElementById('taxRate');
        const discountTypeElement = document.getElementById('discountType');
        const discountValueElement = document.getElementById('discountValue');
        const notesContentElement = document.getElementById('notesContent');
        
        const invoiceData = {
            provider: {
                name: bizNameElement ? bizNameElement.textContent : '',
                businessType: businessTypeElement ? businessTypeElement.textContent : '',
                address: addressElement ? addressElement.textContent : '',
                phone: phoneElement ? phoneElement.textContent : '',
                email: emailElement ? emailElement.textContent : ''
            },
            client: {
                name: clientNameElement ? clientNameElement.textContent : '',
                address: clientAddressElement ? clientAddressElement.textContent : '',
                phone: clientPhoneElement ? clientPhoneElement.textContent : '',
                email: clientEmailElement ? clientEmailElement.textContent : ''
            },
            invoice: {
                number: invoiceNumberElement ? invoiceNumberElement.textContent : '',
                date: invoiceDateElement ? invoiceDateElement.value : '',
                dueDate: dueDateElement ? dueDateElement.value : '',
                dateRange: invoiceDateRangeElement ? invoiceDateRangeElement.textContent : 'Not set'
            },
            financial: {
                hourlyRate: hourlyRateElement ? hourlyRateElement.value : 0,
                taxRate: taxRateElement ? taxRateElement.value : 0,
                discountType: discountTypeElement ? discountTypeElement.value : 'percentage',
                discountValue: discountValueElement ? discountValueElement.value : 0
            },
            services: Array.from(document.querySelectorAll('.service-item')).map(item => ({
                description: item.querySelector('.service-description')?.value || '',
                date: item.querySelector('input[type="date"]')?.value || '',
                hours: item.querySelector('input[type="number"]')?.value || '',
                category: item.querySelector('select')?.value || 'other',
                confirmed: item.classList.contains('confirmed')
            })),
            notes: notesContentElement ? notesContentElement.value : ''
        };
        
        localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
        
        // Update the print dates whenever we save
        updatePrintDates();
    } catch (error) {
        console.error('Error saving invoice data:', error);
        showToast('Error saving invoice data', 'error');
    }
}

/**
 * Load invoice data from localStorage
 * Populates the form with saved data
 */
function loadInvoiceData() {
    try {
        const savedData = localStorage.getItem('invoiceData');
        if (!savedData) return;
        
        const data = JSON.parse(savedData);
        
        // Load provider data
        if (data.provider) {
            if (document.getElementById('bizName')) {
                document.getElementById('bizName').textContent = data.provider.name || '';
            }
            if (document.getElementById('businessType')) {
                document.getElementById('businessType').textContent = data.provider.businessType || '';
            }
            if (document.getElementById('address')) {
                document.getElementById('address').textContent = data.provider.address || '';
            }
            if (document.getElementById('phone')) {
                document.getElementById('phone').textContent = data.provider.phone || '';
            }
            if (document.getElementById('email')) {
                document.getElementById('email').textContent = data.provider.email || '';
            }
        }
        
        // Load client data
        if (data.client) {
            if (document.getElementById('clientName')) {
                document.getElementById('clientName').textContent = data.client.name || '';
            }
            if (document.getElementById('clientAddress')) {
                document.getElementById('clientAddress').textContent = data.client.address || '';
            }
            if (document.getElementById('clientPhone')) {
                document.getElementById('clientPhone').textContent = data.client.phone || '';
            }
            if (document.getElementById('clientEmail')) {
                document.getElementById('clientEmail').textContent = data.client.email || '';
            }
        }
        
        // Load invoice data
        if (data.invoice) {
            if (document.getElementById('invoiceNumber')) {
                document.getElementById('invoiceNumber').textContent = data.invoice.number || '';
            }
            if (document.getElementById('invoiceDate')) {
                document.getElementById('invoiceDate').value = data.invoice.date || '';
            }
            if (document.getElementById('dueDate')) {
                document.getElementById('dueDate').value = data.invoice.dueDate || '';
            }
            if (document.getElementById('invoiceDateRange')) {
                document.getElementById('invoiceDateRange').textContent = data.invoice.dateRange || 'Not set';
            }
        }
        
        // Load financial data
        if (data.financial) {
            if (document.getElementById('hourlyRate')) {
                document.getElementById('hourlyRate').value = data.financial.hourlyRate || 0;
            }
            if (document.getElementById('taxRate')) {
                document.getElementById('taxRate').value = data.financial.taxRate || 0;
            }
            if (document.getElementById('discountType')) {
                document.getElementById('discountType').value = data.financial.discountType || 'percentage';
            }
            if (document.getElementById('discountValue')) {
                document.getElementById('discountValue').value = data.financial.discountValue || 0;
            }
        }
        
        // Load notes
        if (document.getElementById('notesContent')) {
            document.getElementById('notesContent').value = data.notes || '';
        }
        
        // Load services
        if (data.services && data.services.length > 0) {
            const serviceList = document.getElementById('serviceList');
            if (serviceList) {
                serviceList.innerHTML = '';
                
                data.services.forEach(service => {
                    const serviceItem = addService();
                    
                    if (serviceItem) {
                        const descElement = serviceItem.querySelector('.service-description');
                        const dateElement = serviceItem.querySelector('input[type="date"]');
                        const hoursElement = serviceItem.querySelector('input[type="number"]');
                        const categoryElement = serviceItem.querySelector('select');
                        
                        if (descElement) descElement.value = service.description || '';
                        if (dateElement) dateElement.value = service.date || '';
                        if (hoursElement) hoursElement.value = service.hours || '';
                        if (categoryElement) categoryElement.value = service.category || 'other';
                        
                        // Set confirmed state if needed
                        if (service.confirmed) {
                            const inputs = serviceItem.querySelectorAll('input, select');
                            inputs.forEach(input => {
                                input.setAttribute('readonly', true);
                                input.style.borderColor = 'transparent';
                            });
                            
                            serviceItem.classList.add('confirmed');
                            updateServicePrintData(serviceItem);
                        }
                    }
                });
            }
        }
        
        // Update displays
        updateDisplayHourlyRate();
        updatePrintDates();
        
        showToast('Invoice data loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading invoice data:', error);
        showToast('Error loading saved invoice data', 'error');
    }
}

/**
 * Save the invoice
 * Validates and saves all invoice data
 */
function saveInvoice() {
    try {
        if (!validateAllFields(true)) {
            return;
        }
        
        saveInvoiceData();
        showToast('Invoice saved successfully', 'success');
    } catch (error) {
        console.error('Error saving invoice:', error);
        showToast('Error saving invoice', 'error');
    }
}

/**
 * Open PDF export instructions modal
 */
function openPdfInstructions() {
    try {
        if (!validateAllFields(true)) {
            return;
        }
        
        const pdfInstructionsModal = document.getElementById('pdfInstructionsModal');
        pdfInstructionsModal.style.display = 'flex';
        
        // Animate opening
        setTimeout(() => {
            pdfInstructionsModal.classList.add('visible');
        }, 10);
    } catch (error) {
        console.error('Error opening PDF instructions:', error);
        showToast('Error opening PDF export instructions', 'error');
    }
}

/**
 * Close PDF instructions modal
 */
function closePdfInstructions() {
    try {
        const pdfInstructionsModal = document.getElementById('pdfInstructionsModal');
        pdfInstructionsModal.classList.remove('visible');
        
        // Delay actual hiding for transition
        setTimeout(() => {
            pdfInstructionsModal.style.display = 'none';
        }, 300);
    } catch (error) {
        console.error('Error closing PDF instructions:', error);
    }
}

/**
 * Export invoice to PDF using browser's print-to-PDF function
 */
function exportToPdf() {
    try {
        if (!validateAllFields(true)) {
            return;
        }
        
        closePdfInstructions();
        
        // Get page size selection
        const pageSize = document.getElementById('pdfPageSize').value;
        const invoiceNumber = document.getElementById('invoiceNumber').textContent.trim();
        
        // Save current data and update print dates
        saveInvoiceData();
        updatePrintDates();
        
        // Create print window with the appropriate page size
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to export the invoice as PDF.');
            return;
        }
        
        // Add custom page size CSS
        const pageSizeCSS = pageSize === 'a4' ? 
            '@page { size: A4; margin: 0.25in; }' : 
            '@page { size: letter; margin: 0.25in; }';
        
        // Clone the container for printing
        const container = document.querySelector('.container').cloneNode(true);
        
        // Add print-content class to container
        container.classList.add('print-content');
        
        // Remove non-printable elements
        container.querySelectorAll('.no-print').forEach(el => {
            el.remove();
        });
        
        // Show print-only elements
        container.querySelectorAll('.print-only').forEach(el => {
            el.style.display = 'block';
        });
        
        // Hide empty fields in business info
        const headerElements = container.querySelectorAll('.invoice-header p, .invoice-header span');
        headerElements.forEach(el => {
            if (!el.textContent.trim() || el.textContent.includes('Your Business') || 
                el.textContent === 'Professional Services' || 
                el.textContent.includes('123 Business') ||
                el.textContent.includes('555-123') ||
                el.textContent.includes('contact@yourbusiness')) {
                el.classList.add('print-empty');
            }
        });
        
        // Hide empty fields in client info
        const clientElements = container.querySelectorAll('.invoice-to p, .invoice-to span');
        clientElements.forEach(el => {
            if (!el.textContent.trim() || el.textContent.includes('Client Name, Inc.') || 
                el.textContent.includes('456 Client Street') ||
                el.textContent.includes('555-987') ||
                el.textContent.includes('client@example')) {
                el.classList.add('print-empty');
            }
        });
        
        // Make sure date section is hidden
        container.querySelectorAll('.date-inputs').forEach(el => {
            el.style.display = 'none';
        });
        
        // Transform service items to print layout and remove empty ones
        container.querySelectorAll('.service-item').forEach(item => {
            // Skip incomplete items
            if (item.getAttribute('data-print-empty') === 'true') {
                item.remove();
                return;
            }
            
            const printContent = item.getAttribute('data-print');
            if (printContent) {
                // Replace the service item content with the print content
                item.innerHTML = printContent;
                // Ensure no border appears on the left
                item.style.borderLeft = 'none';
            }
            
            // Remove any remaining interactive elements
            item.querySelectorAll('button, .service-actions, .error-message').forEach(el => {
                el.remove();
            });
        });
        
        // Check if there are any service items left
        const remainingServices = container.querySelectorAll('.service-item');
        if (remainingServices.length === 0) {
            showToast('No valid service items to export. Please add services.', 'error');
            printWindow.close();
            return;
        }
        
        // Add PDF title suggestion
        let fileName = 'invoice';
        if (invoiceNumber) {
            fileName = 'invoice-' + invoiceNumber.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        }
        
        // Create print document with custom title for PDF saving and link the CSS file
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fileName}</title>
                <link rel="stylesheet" href="invoice.css">
                <style>
                    ${pageSizeCSS}
                </style>
            </head>
            <body class="print-body">
                ${container.outerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Wait for resources to load before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        }, 1000); // Increased timeout to allow CSS to load
        
        showToast('PDF export prepared. Select "Save as PDF" in the print dialog', 'info');
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        showToast('Error exporting to PDF', 'error');
    }
}

/**
 * Print the invoice
 * Creates a print-optimized version of the invoice
 */
function printInvoice() {
    try {
        if (!validateAllFields(true)) {
            return;
        }
        
        // Save current data and update print dates
        saveInvoiceData();
        updatePrintDates();
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the invoice.');
            return;
        }
        
        // Clone the container for printing
        const container = document.querySelector('.container').cloneNode(true);
        
        // Add print-content class to container
        container.classList.add('print-content');
        
        // Remove non-printable elements
        container.querySelectorAll('.no-print').forEach(el => {
            el.remove();
        });
        
        // Show print-only elements
        container.querySelectorAll('.print-only').forEach(el => {
            el.style.display = 'block';
        });
        
        // Hide empty fields in business info
        const headerElements = container.querySelectorAll('.invoice-header p, .invoice-header span');
        headerElements.forEach(el => {
            if (!el.textContent.trim() || el.textContent.includes('Your Business') || 
                el.textContent === 'Professional Services' || 
                el.textContent.includes('123 Business') ||
                el.textContent.includes('555-123') ||
                el.textContent.includes('contact@yourbusiness')) {
                el.classList.add('print-empty');
            }
        });
        
        // Hide empty fields in client info
        const clientElements = container.querySelectorAll('.invoice-to p, .invoice-to span');
        clientElements.forEach(el => {
            if (!el.textContent.trim() || el.textContent.includes('Client Name, Inc.') || 
                el.textContent.includes('456 Client Street') ||
                el.textContent.includes('555-987') ||
                el.textContent.includes('client@example')) {
                el.classList.add('print-empty');
            }
        });
        
        // Make sure date section is hidden
        container.querySelectorAll('.date-inputs').forEach(el => {
            el.style.display = 'none';
        });
        
        // Transform service items to print layout and remove empty ones
        container.querySelectorAll('.service-item').forEach(item => {
            // Skip incomplete items
            if (item.getAttribute('data-print-empty') === 'true') {
                item.remove();
                return;
            }
            
            const printContent = item.getAttribute('data-print');
            if (printContent) {
                // Replace the service item content with the print content
                item.innerHTML = printContent;
                // Ensure no border appears on the left
                item.style.borderLeft = 'none';
            }
            
            // Remove any remaining interactive elements
            item.querySelectorAll('button, .service-actions, .error-message').forEach(el => {
                el.remove();
            });
        });
        
        // Check if there are any service items left
        const remainingServices = container.querySelectorAll('.service-item');
        if (remainingServices.length === 0) {
            showToast('No valid service items to print. Please add services.', 'error');
            printWindow.close();
            return;
        }
        
        // Create print document with link to the CSS file
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${document.getElementById('invoiceNumber').textContent}</title>
                <link rel="stylesheet" href="invoice.css">
            </head>
            <body class="print-body">
                ${container.outerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Wait for resources to load before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        }, 1000); // Increased timeout to allow CSS to load
        
        showToast('Preparing invoice for printing...', 'info');
    } catch (error) {
        console.error('Error printing invoice:', error);
        showToast('Error printing invoice', 'error');
    }
}

/**
 * Clear invoice data
 * Resets the form and clears saved data
 */
function clearInvoice() {
    try {
        if (confirm('Are you sure you want to clear all invoice data? This action cannot be undone.')) {
            localStorage.removeItem('invoiceData');
            location.reload();
        }
    } catch (error) {
        console.error('Error clearing invoice:', error);
        showToast('Error clearing invoice data', 'error');
    }
}

/**
 * Open style customization modal
 */
function openStyleModal() {
    try {
        const styleModal = document.getElementById('styleModal');
        styleModal.style.display = 'flex';
        
        // Animate opening
        setTimeout(() => {
            styleModal.classList.add('visible');
        }, 10);
    } catch (error) {
        console.error('Error opening style modal:', error);
    }
}

/**
 * Close style customization modal
 */
function closeStyleModal() {
    try {
        const styleModal = document.getElementById('styleModal');
        styleModal.classList.remove('visible');
        
        // Delay actual hiding for transition
        setTimeout(() => {
            styleModal.style.display = 'none';
        }, 300);
    } catch (error) {
        console.error('Error closing style modal:', error);
    }
}

/**
 * Apply custom styles
 * Updates CSS variables based on user selections
 */
function applyStyles() {
    try {
        const primaryColor = document.getElementById('primaryColor').value;
        const secondaryColor = document.getElementById('secondaryColor').value;
        const accentColor = document.getElementById('accentColor').value;
        const fontFamily = document.getElementById('fontFamily').value;
        const themeMode = document.getElementById('themeMode').value;
        
        // Apply CSS variables
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);
        document.body.style.fontFamily = fontFamily;
        
        // Apply theme mode
        toggleDarkMode(themeMode === 'dark');
        
        // Save style settings
        localStorage.setItem('invoiceStyles', JSON.stringify({
            primaryColor, 
            secondaryColor, 
            accentColor, 
            fontFamily,
            darkMode: themeMode === 'dark'
        }));
        
        closeStyleModal();
        showToast('Styles applied successfully', 'success');
    } catch (error) {
        console.error('Error applying styles:', error);
        showToast('Error applying custom styles', 'error');
    }
}

/**
 * Toggle dark mode
 * 
 * @param {boolean} isDark - Whether to enable dark mode
 */
function toggleDarkMode(isDark) {
    try {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    } catch (error) {
        console.error('Error toggling dark mode:', error);
    }
}

/**
 * Reset styles to default
 */
function resetStyles() {
    try {
        // Reset to default values
        document.documentElement.style.setProperty('--primary-color', '#2563eb');
        document.documentElement.style.setProperty('--secondary-color', '#334155');
        document.documentElement.style.setProperty('--accent-color', '#f97316');
        document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
        
        // Reset theme mode
        document.body.classList.remove('dark-mode');
        
        // Update input fields
        document.getElementById('primaryColor').value = '#2563eb';
        document.getElementById('secondaryColor').value = '#334155';
        document.getElementById('accentColor').value = '#f97316';
        document.getElementById('fontFamily').value = "'Inter', system-ui, sans-serif";
        document.getElementById('themeMode').value = 'light';
        
        // Remove saved styles
        localStorage.removeItem('invoiceStyles');
        
        closeStyleModal();
        showToast('Styles reset to defaults', 'info');
    } catch (error) {
        console.error('Error resetting styles:', error);
        showToast('Error resetting styles', 'error');
    }
}

/**
 * Load saved styles
 * Applies previously saved style customizations
 */
function loadSavedStyles() {
    try {
        const savedStyles = localStorage.getItem('invoiceStyles');
        if (!savedStyles) return;
        
        const styles = JSON.parse(savedStyles);
        
        if (styles.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', styles.primaryColor);
            const primaryColorInput = document.getElementById('primaryColor');
            if (primaryColorInput) primaryColorInput.value = styles.primaryColor;
        }
        
        if (styles.secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', styles.secondaryColor);
            const secondaryColorInput = document.getElementById('secondaryColor');
            if (secondaryColorInput) secondaryColorInput.value = styles.secondaryColor;
        }
        
        if (styles.accentColor) {
            document.documentElement.style.setProperty('--accent-color', styles.accentColor);
            const accentColorInput = document.getElementById('accentColor');
            if (accentColorInput) accentColorInput.value = styles.accentColor;
        }
        
        if (styles.fontFamily) {
            document.body.style.fontFamily = styles.fontFamily;
            const fontFamilySelect = document.getElementById('fontFamily');
            if (fontFamilySelect) fontFamilySelect.value = styles.fontFamily;
        }
        
        // Apply dark mode if saved
        if (styles.darkMode) {
            toggleDarkMode(true);
            const themeModeSelect = document.getElementById('themeMode');
            if (themeModeSelect) themeModeSelect.value = 'dark';
        }
    } catch (error) {
        console.error('Error loading saved styles:', error);
        showToast('Error loading custom styles', 'error');
    }
}

/**
 * Show toast notification
 * 
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    try {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = toast.querySelector('.toast-icon');
        
        // Set message
        toastMessage.textContent = message;
        
        // Set type and icon
        toast.className = `toast toast-${type}`;
        
        switch (type) {
            case 'success':
                toastIcon.innerHTML = '✓';
                break;
            case 'error':
                toastIcon.innerHTML = '✗';
                break;
            case 'warning':
                toastIcon.innerHTML = '⚠';
                break;
            case 'info':
            default:
                toastIcon.innerHTML = 'ℹ';
                break;
        }
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);
        
        // Hide after duration
        setTimeout(() => {
            toast.classList.remove('visible');
        }, duration);
    } catch (error) {
        console.error('Error showing toast notification:', error);
    }
}