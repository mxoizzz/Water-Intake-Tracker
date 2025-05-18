// Constants
const CONSTANTS = {
    MIN_GOAL: 0,
    ANIMATION_DELAY: 300,
    BUTTON_ANIMATION_DELAY: 150,
    STORAGE_KEYS: {
        WATER_DATA: 'waterData',
        CONTACT_MESSAGES: 'contactMessages'
    }
};

// State Management
const WaterState = {
    current: 0,
    goal: 2000,
    
    update(newCurrent, newGoal) {
        this.current = newCurrent ?? this.current;
        this.goal = newGoal ?? this.goal;
        this.save();
        UI.updateProgress();
    },
    
    addWater(amount) {
        this.update(this.current + amount);
    },
    
    reset() {
        this.update(0);
    },
    
    save() {
        try {
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.WATER_DATA, JSON.stringify({
                current: this.current,
                goal: this.goal
            }));
        } catch (error) {
            console.error('Error saving water data:', error);
        }
    },
    
    load() {
        try {
            const data = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE_KEYS.WATER_DATA));
            if (data) {
                this.update(data.current, data.goal);
                UI.setGoalInput(this.goal);
            }
        } catch (error) {
            console.error('Error loading water data:', error);
        }
    }
};

// UI Management
const UI = {
    elements: {
        progressBar: () => document.querySelector('.progress'),
        progressText: () => document.querySelector('.progress-text'),
        waterButtons: () => document.querySelectorAll('.water-btn'),
        resetButton: () => document.querySelector('.reset-btn'),
        goalInput: () => document.getElementById('daily-goal'),
        navLinks: () => document.querySelector('.nav-links'),
        contactForm: () => document.getElementById('contactForm')
    },
    
    updateProgress() {
        const progressBar = this.elements.progressBar();
        const progressText = this.elements.progressText();
        if (!progressBar || !progressText) return;
        
        const percentage = (WaterState.current / WaterState.goal) * 100;
        
        // Update progress bar width
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
        
        // Update text
        progressText.textContent = `${WaterState.current}/${WaterState.goal} ml`;
        
        // Change color based on progress
        if (WaterState.current >= WaterState.goal) {
            progressBar.style.backgroundColor = 'var(--success)';
            if (WaterState.current - WaterState.goal < 500) {
                this.showNotification('🎉 Congratulations! You\'ve reached your daily water intake goal! 💧\nKeep staying hydrated!');
            }
        } else {
            progressBar.style.backgroundColor = 'var(--light-blue)';
        }
    },
    
    setGoalInput(value) {
        const input = this.elements.goalInput();
        if (input) input.value = value;
    },
    
    showNotification(message) {
        // Replace alert with custom notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    },
    
    animateButton(button) {
        if (!button) return;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, CONSTANTS.BUTTON_ANIMATION_DELAY);
    }
};
// Form Management
const ContactForm = {
    validateForm(formData) {
        const errors = [];
        if (!formData.name.trim()) errors.push('Name is required');
        if (!formData.email.trim()) errors.push('Email is required');
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Invalid email format');
        if (!formData.subject.trim()) errors.push('Subject is required');
        if (!formData.message.trim()) errors.push('Message is required');
        return errors;
    },
    
    save(message) {
        try {
            const messages = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE_KEYS.CONTACT_MESSAGES) || '[]');
            messages.push({ ...message, date: new Date().toISOString() });
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving contact message:', error);
            throw new Error('Failed to save message');
        }
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: e.target.name.value,
            email: e.target.email.value,
            subject: e.target.subject.value,
            message: e.target.message.value
        };
        
        const errors = this.validateForm(formData);
        if (errors.length > 0) {
            UI.showNotification(errors.join('\n'));
            return;
        }
        
        try {
            this.save(formData);
            UI.showNotification('Thank you for your message! We will get back to you soon.');
            e.target.reset();
        } catch (error) {
            UI.showNotification('Failed to send message. Please try again.');
        }
    }
};

// Event Handlers
function handleWaterAdd(amount) {
    WaterState.addWater(amount);
    const button = Array.from(UI.elements.waterButtons()).find(btn => 
        btn.querySelector('span').textContent.includes(amount.toString())
    );
    UI.animateButton(button);
}

function handleGoalUpdate() {
    const input = UI.elements.goalInput();
    if (!input) return;
    
    const newGoal = parseInt(input.value);
    if (newGoal > CONSTANTS.MIN_GOAL) {
        WaterState.update(null, newGoal);
    } else {
        UI.showNotification('Please enter a valid goal greater than 0');
    }
}

function handleReset() {
    WaterState.reset();
    UI.animateButton(UI.elements.resetButton());
}

function toggleMobileMenu() {
    UI.elements.navLinks()?.classList.toggle('show');
}
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    WaterState.load();
    ScrollAnimation.init();
    
    // Add event listeners for water buttons
    UI.elements.waterButtons().forEach(button => {
        button.addEventListener('click', () => {
            const amount = parseInt(button.dataset.amount);
            if (!isNaN(amount)) {
                handleWaterAdd(amount);
            }
        });
        
        button.addEventListener('mouseover', () => button.style.transform = 'translateY(-2px)');
        button.addEventListener('mouseout', () => button.style.transform = '');
    });
    
    // Add other event listeners
    document.querySelector('.set-goal-btn')?.addEventListener('click', handleGoalUpdate);
    document.querySelector('.reset-btn')?.addEventListener('click', handleReset);
    document.querySelector('.menu-btn')?.addEventListener('click', toggleMobileMenu);
    
    // Contact form submission
    const contactForm = UI.elements.contactForm();
    if (contactForm) {
        contactForm.addEventListener('submit', e => ContactForm.handleSubmit(e));
    }
}); 
