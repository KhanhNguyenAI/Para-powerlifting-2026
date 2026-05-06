/**
 * Practice Mode - Multi Tap
 * Measures continuous tap speed
 */

(function() {
    'use strict';

    // Game Configuration
    const CONFIG = {
        duration: 10, // seconds
        updateInterval: 100 // ms
    };

    // Game State
    let isGameActive = false;
    let tapCount = 0;
    let startTime = 0;
    let endTime = 0;
    let tapTimes = [];
    let bestSpeed = 0;
    let currentSpeed = 0;
    let timerInterval = null;
    let speedUpdateInterval = null;
    let remainingTime = CONFIG.duration;

    // DOM Elements - will be initialized in init()
    let practiceArea;
    let instruction;
    let tapCountDisplay;
    let currentSpeedDisplay;
    let bestSpeedDisplay;
    let averageSpeedDisplay;
    let timeRemainingDisplay;
    let resultPanel;
    let resultTitle;
    let finalTapCount;
    let finalBestSpeed;
    let finalAverageSpeed;
    let restartBtn;
    let backToMenuBtn;

    /**
     * Update instruction text
     */
    function updateInstruction(text) {
        if (instruction) {
            instruction.textContent = text;
        }
    }

    /**
     * Start game
     */
    function startGame() {
        isGameActive = true;
        tapCount = 0;
        startTime = Date.now();
        endTime = startTime + (CONFIG.duration * 1000);
        tapTimes = [];
        bestSpeed = 0;
        currentSpeed = 0;
        remainingTime = CONFIG.duration;

        // Update displays
        updateDisplays();

        // Update instruction
        updateInstruction('できるだけ速くタップ！');
        practiceArea.style.borderColor = 'rgba(255, 215, 0, 0.8)';
        practiceArea.style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.5)';

        // Start timer
        timerInterval = setInterval(() => {
            if (!isGameActive) {
                clearInterval(timerInterval);
                return;
            }

            const now = Date.now();
            remainingTime = Math.max(0, Math.ceil((endTime - now) / 1000));

            if (timeRemainingDisplay) {
                timeRemainingDisplay.textContent = remainingTime;
            }

            // Warning when time is low
            if (remainingTime <= 3 && remainingTime > 0) {
                practiceArea.style.borderColor = 'rgba(255, 107, 107, 0.8)';
                if (timeRemainingDisplay) {
                    timeRemainingDisplay.style.color = '#ff6b6b';
                }
            }

            if (remainingTime <= 0) {
                endGame();
            }
        }, 1000);

        // Update speed every 500ms
        speedUpdateInterval = setInterval(() => {
            if (!isGameActive) return;
            updateSpeed();
        }, 500);
    }

    /**
     * Handle tap
     */
    function handleTap(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!isGameActive) {
            // Start game on first tap
            startGame();
            return;
        }

        const now = Date.now();
        tapCount++;
        tapTimes.push(now);

        // Update displays
        updateDisplays();

        // Show tap feedback
        showTapFeedback();

        // Update speed immediately
        updateSpeed();
    }

    /**
     * Update speed calculation
     */
    function updateSpeed() {
        if (tapTimes.length === 0) {
            currentSpeed = 0;
            return;
        }

        const now = Date.now();
        const timeWindow = 2000; // 2 seconds window
        const recentTaps = tapTimes.filter(time => now - time < timeWindow);

        if (recentTaps.length > 1) {
            const timeSpan = (recentTaps[recentTaps.length - 1] - recentTaps[0]) / 1000; // in seconds
            currentSpeed = timeSpan > 0 ? (recentTaps.length / timeSpan) : 0;
        } else {
            const elapsed = (now - startTime) / 1000; // in seconds
            currentSpeed = elapsed > 0 ? (tapCount / elapsed) : 0;
        }

        if (currentSpeed > bestSpeed) {
            bestSpeed = currentSpeed;
        }

        // Update displays
        if (currentSpeedDisplay) {
            currentSpeedDisplay.textContent = currentSpeed.toFixed(1);
        }
        if (bestSpeedDisplay) {
            bestSpeedDisplay.textContent = bestSpeed.toFixed(1);
        }
    }

    /**
     * Calculate average speed
     */
    function calculateAverageSpeed() {
        if (tapCount === 0 || startTime === 0) return 0;
        const elapsed = (Date.now() - startTime) / 1000; // in seconds
        return elapsed > 0 ? (tapCount / elapsed) : 0;
    }

    /**
     * Update all displays
     */
    function updateDisplays() {
        if (tapCountDisplay) {
            tapCountDisplay.textContent = tapCount;
        }
    }

    /**
     * Show tap feedback
     */
    function showTapFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'tap-feedback';
        feedback.textContent = '+1';
        feedback.style.position = 'absolute';
        feedback.style.left = Math.random() * 80 + 10 + '%';
        feedback.style.top = Math.random() * 80 + 10 + '%';
        feedback.style.fontSize = '1.5rem';
        feedback.style.fontWeight = 'bold';
        feedback.style.color = '#4fc3f7';
        feedback.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.5)';
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '100';
        feedback.style.animation = 'fadeOutUp 0.8s ease forwards';

        practiceArea.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 800);
    }

    /**
     * End game and show results
     */
    function endGame() {
        isGameActive = false;

        // Clear intervals
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        if (speedUpdateInterval) {
            clearInterval(speedUpdateInterval);
        }

        const averageSpeed = calculateAverageSpeed();

        // Update instruction
        updateInstruction('測定終了');

        // Reset border
        practiceArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        practiceArea.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        if (timeRemainingDisplay) {
            timeRemainingDisplay.style.color = '';
        }

        // Show result panel
        if (resultPanel) {
            resultPanel.style.display = 'block';
        }
        if (resultTitle) {
            resultTitle.textContent = '測定結果';
        }
        if (finalTapCount) {
            finalTapCount.textContent = tapCount + ' 回';
        }
        if (finalBestSpeed) {
            finalBestSpeed.textContent = bestSpeed.toFixed(1) + ' 回/秒';
        }
        if (finalAverageSpeed) {
            finalAverageSpeed.textContent = averageSpeed.toFixed(1) + ' 回/秒';
        }
    }

    /**
     * Reset game
     */
    function resetGame() {
        isGameActive = false;
        tapCount = 0;
        startTime = 0;
        endTime = 0;
        tapTimes = [];
        bestSpeed = 0;
        currentSpeed = 0;
        remainingTime = CONFIG.duration;

        // Clear intervals
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        if (speedUpdateInterval) {
            clearInterval(speedUpdateInterval);
        }

        // Reset displays
        updateDisplays();
        if (currentSpeedDisplay) currentSpeedDisplay.textContent = '0.0';
        if (bestSpeedDisplay) bestSpeedDisplay.textContent = '0.0';
        if (averageSpeedDisplay) averageSpeedDisplay.textContent = '0.0';
        if (timeRemainingDisplay) {
            timeRemainingDisplay.textContent = CONFIG.duration;
            timeRemainingDisplay.style.color = '';
        }

        // Hide result panel
        if (resultPanel) {
            resultPanel.style.display = 'none';
        }

        // Reset instruction
        updateInstruction('タップエリアをクリックして開始');
        practiceArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        practiceArea.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    }

    /**
     * Initialize game
     */
    function init() {
        // Initialize DOM elements
        practiceArea = document.getElementById('practice-area');
        instruction = document.getElementById('instruction');
        tapCountDisplay = document.getElementById('tap-count');
        currentSpeedDisplay = document.getElementById('current-speed');
        bestSpeedDisplay = document.getElementById('best-speed');
        averageSpeedDisplay = document.getElementById('average-speed');
        timeRemainingDisplay = document.getElementById('time-remaining');
        resultPanel = document.getElementById('result-panel');
        resultTitle = document.getElementById('result-title');
        finalTapCount = document.getElementById('final-tap-count');
        finalBestSpeed = document.getElementById('final-best-speed');
        finalAverageSpeed = document.getElementById('final-average-speed');
        restartBtn = document.getElementById('restart-btn');
        backToMenuBtn = document.getElementById('back-to-menu-btn');

        // Check if elements exist
        if (!practiceArea) {
            console.error('Practice area element not found!');
            return;
        }

        // Add CSS animation for feedback
        if (!document.getElementById('practice-feedback-style')) {
            const style = document.createElement('style');
            style.id = 'practice-feedback-style';
            style.textContent = `
                @keyframes fadeOutUp {
                    0% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Setup event listeners
        practiceArea.addEventListener('click', handleTap);
        practiceArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleTap();
        });

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                resetGame();
            });
        }

        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                location.href = '../practice.html';
            });
        }

        // Initial instruction
        updateInstruction('タップエリアをクリックして開始');

        // Allow ending game with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isGameActive) {
                endGame();
            }
        });

        console.log('Practice multi tap mode initialized');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

