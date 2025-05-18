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
