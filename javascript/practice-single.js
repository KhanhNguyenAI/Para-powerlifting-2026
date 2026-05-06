/**
 * Practice Mode - Single Tap
 * Measures single tap speed and reaction time
 */

(function() {
    'use strict';

    // Game State
    let isWaitingForTap = false;
    let tapStartTime = 0;
    let tapEndTime = 0;
    let tapCount = 0;
    let bestTime = null;
    let averageTime = 0;
    let totalTime = 0;
    let tapTimes = [];
    let isGameActive = false;

    // DOM Elements - will be initialized in init()
    let practiceArea;
    let instruction;
    let tapCountDisplay;
    let bestTimeDisplay;
    let averageTimeDisplay;
    let currentTimeDisplay;
    let tapIndicator;
    let resultPanel;
    let resultTitle;
    let finalBestTime;
    let finalAverageTime;
    let finalTapCount;
    let restartBtn;
    let backToMenuBtn;

    /**
     * Generate random delay between 1-3 seconds
     */
    function getRandomDelay() {
        return Math.random() * 2000 + 1000; // 1-3 seconds
    }

    /**
     * Show tap indicator
     */
    function showTapIndicator() {
        if (tapIndicator) {
            tapIndicator.style.display = 'block';
            tapIndicator.style.animation = 'bounce 0.5s ease infinite';
        }
    }

    /**
     * Hide tap indicator
     */
    function hideTapIndicator() {
        if (tapIndicator) {
            tapIndicator.style.display = 'none';
        }
    }

    /**
     * Update instruction text
     */
    function updateInstruction(text) {
        if (instruction) {
            instruction.textContent = text;
        }
    }

    /**
     * Start waiting for tap
     */
    function startWaitingForTap() {
        isWaitingForTap = true;
        updateInstruction('準備...');
        hideTapIndicator();
        
        // Random delay before showing tap indicator
        const delay = getRandomDelay();
        
        setTimeout(() => {
            if (isGameActive && isWaitingForTap) {
                tapStartTime = Date.now();
                updateInstruction('タップ！');
                showTapIndicator();
                practiceArea.style.borderColor = 'rgba(255, 215, 0, 0.8)';
                practiceArea.style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.5)';
            }
        }, delay);
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
            // Start first round
            isGameActive = true;
            startWaitingForTap();
            return;
        }

        if (!isWaitingForTap) {
            // Start next round
            startWaitingForTap();
            return;
        }

        if (tapStartTime === 0) {
            // Too early - tapped before indicator appeared
            updateInstruction('早すぎます！待ってください');
            practiceArea.style.borderColor = 'rgba(255, 107, 107, 0.8)';
            practiceArea.style.boxShadow = '0 12px 40px rgba(255, 107, 107, 0.5)';
            
            setTimeout(() => {
                if (isGameActive) {
                    startWaitingForTap();
                }
            }, 1000);
            return;
        }

        // Valid tap
        tapEndTime = Date.now();
        const reactionTime = tapEndTime - tapStartTime;
        
        tapCount++;
        tapTimes.push(reactionTime);
        totalTime += reactionTime;
        averageTime = totalTime / tapCount;

        if (bestTime === null || reactionTime < bestTime) {
            bestTime = reactionTime;
        }

        // Update displays
        updateDisplays(reactionTime);

        // Reset for next tap
        tapStartTime = 0;
        isWaitingForTap = false;
        hideTapIndicator();
        practiceArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        practiceArea.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';

        // Show feedback
        showTapFeedback(reactionTime);

        // Continue to next tap
        setTimeout(() => {
            if (isGameActive) {
                startWaitingForTap();
            }
        }, 500);
    }

    /**
     * Update all displays
     */
    function updateDisplays(currentTime) {
        if (tapCountDisplay) {
            tapCountDisplay.textContent = tapCount;
        }
        if (bestTimeDisplay) {
            bestTimeDisplay.textContent = bestTime !== null ? bestTime.toFixed(0) : '---';
        }
        if (averageTimeDisplay) {
            averageTimeDisplay.textContent = averageTime > 0 ? averageTime.toFixed(0) : '---';
        }
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = currentTime.toFixed(0);
        }
    }

    /**
     * Show tap feedback
     */
    function showTapFeedback(time) {
        const feedback = document.createElement('div');
        feedback.className = 'tap-feedback';
        feedback.textContent = time.toFixed(0) + 'ms';
        feedback.style.position = 'absolute';
        feedback.style.left = '50%';
        feedback.style.top = '50%';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.fontSize = '2rem';
        feedback.style.fontWeight = 'bold';
        feedback.style.color = time < 200 ? '#4fc3f7' : time < 400 ? '#ffd700' : '#ff6b6b';
        feedback.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.5)';
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '100';
        feedback.style.animation = 'fadeOutUp 1s ease forwards';

        practiceArea.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }

    /**
     * End game and show results
     */
    function endGame() {
        isGameActive = false;
        isWaitingForTap = false;
        hideTapIndicator();
        updateInstruction('測定終了');

        // Show result panel
        if (resultPanel) {
            resultPanel.style.display = 'block';
        }
        if (resultTitle) {
            resultTitle.textContent = '測定結果';
        }
        if (finalBestTime) {
            finalBestTime.textContent = bestTime !== null ? bestTime.toFixed(0) + ' ms' : '---';
        }
        if (finalAverageTime) {
            finalAverageTime.textContent = averageTime > 0 ? averageTime.toFixed(0) + ' ms' : '---';
        }
        if (finalTapCount) {
            finalTapCount.textContent = tapCount + ' 回';
        }
    }

    /**
     * Reset game
     */
    function resetGame() {
        isGameActive = false;
        isWaitingForTap = false;
        tapStartTime = 0;
        tapEndTime = 0;
        tapCount = 0;
        bestTime = null;
        averageTime = 0;
        totalTime = 0;
        tapTimes = [];

        // Reset displays
        updateDisplays(0);
        if (tapCountDisplay) tapCountDisplay.textContent = '0';
        if (bestTimeDisplay) bestTimeDisplay.textContent = '---';
        if (averageTimeDisplay) averageTimeDisplay.textContent = '---';
        if (currentTimeDisplay) currentTimeDisplay.textContent = '---';

        // Hide result panel
        if (resultPanel) {
            resultPanel.style.display = 'none';
        }

        // Reset instruction
        updateInstruction('タップエリアをクリックして開始');
        hideTapIndicator();
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
        bestTimeDisplay = document.getElementById('best-time');
        averageTimeDisplay = document.getElementById('average-time');
        currentTimeDisplay = document.getElementById('current-time');
        tapIndicator = document.getElementById('tap-indicator');
        resultPanel = document.getElementById('result-panel');
        resultTitle = document.getElementById('result-title');
        finalBestTime = document.getElementById('final-best-time');
        finalAverageTime = document.getElementById('final-average-time');
        finalTapCount = document.getElementById('final-tap-count');
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
                        transform: translate(-50%, -50%) translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) translateY(-50px);
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

        console.log('Practice single tap mode initialized');

        // Initial instruction
        updateInstruction('タップエリアをクリックして開始');
        hideTapIndicator();

        // Allow ending game with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isGameActive) {
                endGame();
            }
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

