/**
 * PARAPOWER GAME - Easy Mode
 * Modern gameplay with 3D effects and particles
 */

(function() {
    'use strict';

    // Game Configuration
    const CONFIG = {
        target: 50,           // Target clicks
        timeLimit: 10,        // Time in seconds
        decreasePerClick: 10, // Gauge decrease per click
        initialGauge: 500     // Initial gauge position
    };

    // Game State
    let n = 0;              // Click counter
    let m = CONFIG.initialGauge;
    let count = 1;
    let countDown = CONFIG.timeLimit;
    let isGameActive = true;
    let canvas, context;
    let startTimer2;
    
    // Combo & Stats
    let combo = 0;
    let lastTapTime = 0;
    const comboTimeout = 1000; // 1 second to maintain combo
    let tapTimes = []; // Store tap timestamps for speed calculation
    let bestStreak = 0;
    let currentStreak = 0;
    let gameStartTime = 0;
    let totalTaps = 0;

    // DOM Elements
    const counter = document.getElementById("counter");
    const result2 = document.getElementById("result2");
    const progressBar = document.getElementById("progress-bar");
    const progressPercent = document.getElementById("progress-percent");
    const progressGlow = document.querySelector(".progress-bar-glow");
    const character = document.getElementById("character");
    const tapFeedback = document.getElementById("tap-feedback");
    const particlesContainer = document.getElementById("particles-container");
    const comboDisplay = document.getElementById("combo-display");
    const comboCount = document.getElementById("combo-count");
    const comboMultiplier = document.getElementById("combo-multiplier");
    const tapSpeed = document.getElementById("tap-speed");
    const timeWarning = document.getElementById("time-warning");
    const multiTouchWarning = document.getElementById("multi-touch-warning");
    let warningTimeout = null;

    /**
     * Initialize Canvas
     */
    function initCanvas() {
        canvas = document.getElementById("bar");
        if (!canvas) return;
        
        context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        drawGauge();
    }

    /**
     * Draw gauge on canvas with 3D effect
     */
    function drawGauge() {
        if (!context || !canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        context.clearRect(0, 0, width, height);

        // Calculate gauge position
        const gaugeHeight = height * 0.4;
        const gaugeTop = height * 0.6;
        const currentHeight = (m / CONFIG.initialGauge) * gaugeHeight;

        // Draw background gradient
        const gradient = context.createLinearGradient(0, gaugeTop, 0, height);
        gradient.addColorStop(0, "rgba(30, 30, 50, 0.8)");
        gradient.addColorStop(1, "rgba(10, 10, 30, 0.9)");
        context.fillStyle = gradient;
        context.fillRect(0, gaugeTop, width, gaugeHeight);

        // Draw gauge fill with gradient
        if (m > 0) {
            const fillGradient = context.createLinearGradient(
                0, gaugeTop + (gaugeHeight - currentHeight),
                0, height
            );
            fillGradient.addColorStop(0, "#4fc3f7");
            fillGradient.addColorStop(0.5, "#29b6f6");
            fillGradient.addColorStop(1, "#0277bd");
            
            context.fillStyle = fillGradient;
            context.fillRect(0, gaugeTop + (gaugeHeight - currentHeight), width, currentHeight);
            
            // Add shine effect
            const shineGradient = context.createLinearGradient(
                0, gaugeTop + (gaugeHeight - currentHeight),
                0, gaugeTop + (gaugeHeight - currentHeight) + currentHeight * 0.3
            );
            shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
            shineGradient.addColorStop(1, "transparent");
            context.fillStyle = shineGradient;
            context.fillRect(0, gaugeTop + (gaugeHeight - currentHeight), width, currentHeight * 0.3);
        } else {
            // Red for completion
            const redGradient = context.createLinearGradient(0, gaugeTop, 0, height);
            redGradient.addColorStop(0, "#ff6b6b");
            redGradient.addColorStop(1, "#c92a2a");
            context.fillStyle = redGradient;
            context.fillRect(0, gaugeTop, width, gaugeHeight);
        }
    }

    /**
     * Update progress bar
     */
    function updateProgress() {
        const percentage = Math.min((n / CONFIG.target) * 100, 100);
        progressBar.style.width = percentage + "%";
        progressGlow.style.width = percentage + "%";
        progressPercent.textContent = Math.floor(percentage) + "%";
    }

    /**
     * Create particle effect
     */
    function createParticle(x, y) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        
        const randomX = (Math.random() - 0.5) * 100;
        particle.style.setProperty("--random-x", randomX + "px");
        
        particlesContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1500);
    }

    /**
     * Calculate combo multiplier
     */
    function getComboMultiplier(comboCount) {
        if (comboCount >= 50) return 2.0;
        if (comboCount >= 30) return 1.8;
        if (comboCount >= 20) return 1.5;
        if (comboCount >= 10) return 1.3;
        if (comboCount >= 5) return 1.2;
        return 1.0;
    }

    /**
     * Update combo display
     */
    function updateComboDisplay() {
        if (combo > 0) {
            comboDisplay.classList.add("active");
            comboCount.textContent = combo;
            const multiplier = getComboMultiplier(combo);
            comboMultiplier.textContent = `x${multiplier.toFixed(1)}`;
        } else {
            comboDisplay.classList.remove("active");
        }
    }

    /**
     * Update tap speed display
     */
    function updateTapSpeed() {
        const now = Date.now();
        // Keep only taps from last 2 seconds
        tapTimes = tapTimes.filter(time => now - time < 2000);
        
        if (tapTimes.length > 0) {
            const speed = (tapTimes.length / 2).toFixed(1);
            tapSpeed.textContent = speed;
        } else {
            tapSpeed.textContent = "0";
        }
    }

    /**
     * Show tap feedback
     */
    function showTapFeedback(x, y, multiplier) {
        const feedbackText = multiplier > 1.0 ? `+${Math.floor(multiplier)}` : "+1";
        tapFeedback.textContent = feedbackText;
        tapFeedback.style.left = x + "px";
        tapFeedback.style.top = y + "px";
        tapFeedback.classList.add("active");

        setTimeout(() => {
            tapFeedback.classList.remove("active");
        }, 400);

        // Create particle
        createParticle(x, y);
    }

    /**
     * Show multi-touch warning
     */
    function showMultiTouchWarning() {
        if (multiTouchWarning) {
            multiTouchWarning.classList.add("active");
            
            // Clear existing timeout
            if (warningTimeout) {
                clearTimeout(warningTimeout);
            }
            
            // Hide warning after 2 seconds
            warningTimeout = setTimeout(() => {
                if (multiTouchWarning) {
                    multiTouchWarning.classList.remove("active");
                }
            }, 2000);
        }
    }

    /**
     * Handle click/tap
     */
    function addCount(event) {
        if (!isGameActive) return;

        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime;
        
        // Update combo
        if (timeSinceLastTap < comboTimeout && lastTapTime > 0) {
            combo++;
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
        } else {
            combo = 1;
            currentStreak = 1;
        }
        
        lastTapTime = now;
        tapTimes.push(now);
        totalTaps++;
        
        // Calculate multiplier and bonus
        const multiplier = getComboMultiplier(combo);
        const bonusDecrease = CONFIG.decreasePerClick * multiplier;
        
        n++;
        counter.innerHTML = n;
        
        // Update gauge with bonus
        m = Math.max(0, m - bonusDecrease);
        drawGauge();
        updateProgress();
        updateComboDisplay();
        updateTapSpeed();

        // Character animation
        character.classList.add("active");
        setTimeout(() => {
            character.classList.remove("active");
        }, 100);

        // Tap feedback
        const x = event ? event.clientX || event.touches[0].clientX : window.innerWidth / 2;
        const y = event ? event.clientY || event.touches[0].clientY : window.innerHeight / 2;
        showTapFeedback(x, y, multiplier);

        // Check if goal reached
        if (m <= 0 && n >= CONFIG.target) {
            endGame(true);
        }
    }
    
    /**
     * Combo decay timer
     */
    function startComboDecay() {
        setInterval(() => {
            if (!isGameActive) return;
            const now = Date.now();
            if (now - lastTapTime >= comboTimeout && combo > 0) {
                combo = 0;
                currentStreak = 0;
                updateComboDisplay();
            }
        }, 100);
    }

    /**
     * Calculate game statistics
     */
    function calculateStats() {
        const gameDuration = (Date.now() - gameStartTime) / 1000; // in seconds
        const clicksPerSecond = gameDuration > 0 ? (totalTaps / gameDuration).toFixed(2) : "0.00";
        const accuracy = CONFIG.target > 0 ? ((n / CONFIG.target) * 100).toFixed(1) : "0.0";
        
        return {
            clicksPerSecond: clicksPerSecond,
            accuracy: accuracy,
            bestStreak: bestStreak,
            totalTaps: totalTaps,
            finalCombo: combo
        };
    }

    /**
     * End game
     */
    function endGame(success) {
        isGameActive = false;
        if (startTimer2) clearInterval(startTimer2);
        
        const stats = calculateStats();
        
        // Store stats in sessionStorage to pass to result page
        sessionStorage.setItem('gameStats', JSON.stringify({
            success: success,
            clicksPerSecond: stats.clicksPerSecond,
            accuracy: stats.accuracy,
            bestStreak: stats.bestStreak,
            totalTaps: stats.totalTaps,
            finalCombo: stats.finalCombo,
            target: CONFIG.target,
            achieved: n
        }));
        
        setTimeout(() => {
            if (success) {
                location.href = "../success.html";
            } else {
                location.href = "../failure.html";
            }
        }, 500);
    }

    /**
     * Initialize game
     */
    function init() {
        // Set initial values
        counter.innerHTML = "0";
        result2.innerHTML = CONFIG.timeLimit;
        gameStartTime = Date.now();
        
        // Initialize canvas
        initCanvas();
        
        // Setup resize handler
        window.addEventListener("resize", () => {
            initCanvas();
        });

        // Setup click/touch handlers
        document.body.addEventListener("click", addCount);
        
        // Multi-touch detection for easy mode
        document.body.addEventListener("touchstart", (e) => {
            if (e.touches.length > 2) {
                showMultiTouchWarning();
            }
        });
        
        document.body.addEventListener("touchend", (e) => {
            e.preventDefault();
            addCount(e);
        });

        // Start combo decay timer
        startComboDecay();
        
        // Update tap speed every 500ms
        setInterval(() => {
            if (isGameActive) {
                updateTapSpeed();
            }
        }, 500);

        // Timer
        startTimer2 = setInterval(() => {
            countDown = CONFIG.timeLimit - count;
            result2.innerHTML = countDown;
            count++;

            // Show warning when time is low
            if (countDown <= 3 && countDown > 0) {
                timeWarning.classList.add("active");
                result2.classList.add("warning");
            } else {
                timeWarning.classList.remove("active");
                result2.classList.remove("warning");
            }

            if (countDown <= 0) {
                clearInterval(startTimer2);
                timeWarning.classList.remove("active");
                const success = n >= CONFIG.target && m <= 0;
                endGame(success);
            }
        }, 1000);

        // Disable scroll
        function disableScroll(event) {
            event.preventDefault();
        }
        document.addEventListener("touchmove", disableScroll, { passive: false });
        document.addEventListener("wheel", disableScroll, { passive: false });
    }

    // Start game when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();