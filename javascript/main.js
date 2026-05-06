/**
 * Parapower - 落下アニメーション管理
 * 画像が回転しながら落ちてくるアニメーションを制御します
 */
(function() {
  'use strict';

  // パフォーマンス最適化のための設定
  const CONFIG = {
    animationDuration: 8000, // アニメーション時間（ms）
    removalDelay: 6500, // 要素削除までの遅延（ms）
    characters: [
      { class: "character-1", minSize: 50, maxSize: 70, interval: 1800 },
      { class: "character-2", minSize: 60, maxSize: 70, interval: 2600 },
      { class: "character-3", minSize: 60, maxSize: 70, interval: 3000 }
    ]
  };

  // モバイルデバイスかどうかを判定
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  }

  // モバイル用の設定を取得
  function getMobileConfig() {
    if (isMobileDevice()) {
      return {
        animationDuration: 6000,
        removalDelay: 5000,
        characters: [
          { class: "character-1", minSize: 40, maxSize: 60, interval: 3000 },
          { class: "character-2", minSize: 45, maxSize: 60, interval: 4000 },
          { class: "character-3", minSize: 45, maxSize: 60, interval: 5000 }
        ]
      };
    }
    return CONFIG;
  }

  // パフォーマンス最適化: リクエストアニメーションフレームの管理
  let animationFrameId = null;
  let isAnimating = false;
  let intervalIds = []; // インターバルIDを保存
  let activeCharacters = 0; // アクティブなキャラクター数
  
  // 最大アクティブキャラクター数を取得
  function getMaxActiveCharacters() {
    return isMobileDevice() ? 3 : 8; // モバイルでは最大3つまで
  }

  /**
   * キャラクター要素を作成して落下アニメーションを開始
   * @param {HTMLElement} container - コンテナ要素
   * @param {string} characterClass - キャラクタークラス名
   * @param {number} minSize - 最小サイズ
   * @param {number} maxSize - 最大サイズ
   */
  function createCharacter(container, characterClass, minSize, maxSize) {
    if (!container) return;

    // アクティブなキャラクター数が上限に達している場合は作成しない
    if (activeCharacters >= getMaxActiveCharacters()) {
      return;
    }

    // モバイルでは、ビューポート外の場合は作成しない
    if (isMobileDevice() && (document.hidden || container.offsetParent === null)) {
      return;
    }

    // 要素を作成
    const characterEl = document.createElement("span");
    characterEl.className = `character ${characterClass}`;
    
    // サイズをランダムに設定（モバイルでは少し小さく）
    const currentConfig = getMobileConfig();
    const size = Math.random() * (maxSize - minSize) + minSize;
    characterEl.style.width = `${size}px`;
    characterEl.style.height = `${size}px`;

    // 出現位置をランダムに設定（左右のマージンを考慮）
    // モバイルでは中央寄りに配置してレイアウトシフトを防ぐ
    const leftPosition = isMobileDevice() 
      ? Math.random() * 60 + 20  // 20% ~ 80% (中央寄り)
      : Math.random() * 90 + 5;  // 5% ~ 95%
    characterEl.style.left = `${leftPosition}%`;
    
    // パフォーマンス最適化: GPU加速を有効化
    characterEl.style.willChange = 'transform, opacity';
    characterEl.style.transform = 'translateZ(0)';
    
    // アクセシビリティ: 装飾的な要素としてマーク
    characterEl.setAttribute('aria-hidden', 'true');
    characterEl.setAttribute('role', 'presentation');

    // DOMに追加
    container.appendChild(characterEl);
    activeCharacters++;

    // アニメーション終了後に要素を削除（メモリリーク防止）
    setTimeout(() => {
      if (characterEl.parentNode) {
        characterEl.remove();
        activeCharacters = Math.max(0, activeCharacters - 1);
      }
    }, currentConfig.removalDelay);
  }

  /**
   * アニメーションを初期化
   */
  function initAnimations() {
    const container = document.querySelector(".chara-container");
    
    if (!container) {
      console.warn("コンテナ要素が見つかりません");
      return;
    }

    // モバイルデバイスの場合はアニメーションを軽量化
    const currentConfig = getMobileConfig();

    // 各キャラクタータイプのアニメーションを設定
    currentConfig.characters.forEach(charConfig => {
      const intervalId = setInterval(() => {
        // パフォーマンスチェック: ページが表示されている場合のみ実行
        if (!document.hidden && container.offsetParent !== null && isAnimating) {
          createCharacter(
            container, 
            charConfig.class, 
            charConfig.minSize, 
            charConfig.maxSize
          );
        }
      }, charConfig.interval);

      // インターバルIDを保存
      intervalIds.push(intervalId);

      // ページがアンロードされる際にインターバルをクリーンアップ
      window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
      });
    });
  }

  /**
   * パフォーマンス最適化: Intersection Observerを使用して
   * ビューポート外ではアニメーションを停止
   */
  function setupIntersectionObserver() {
    if (!window.IntersectionObserver) return;

    const container = document.querySelector(".chara-container");
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isAnimating = true;
        } else {
          isAnimating = false;
        }
      });
    }, {
      threshold: 0.1
    });

    observer.observe(container);
  }

  /**
   * リサイズ時の最適化
   */
  function handleResize() {
    // デバウンス処理
    let resizeTimer;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    function handleResizeEvent() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        
        // モバイル/デスクトップの切り替えが発生した場合のみ再初期化
        const wasMobile = lastWidth <= 768;
        const isMobile = currentWidth <= 768;
        
        // モバイルでの画面回転時の処理
        const isOrientationChange = isMobileDevice() && 
          (Math.abs(currentWidth - lastHeight) < 50 || Math.abs(currentHeight - lastWidth) < 50);
        
        if (wasMobile !== isMobile || isOrientationChange) {
          // 既存のインターバルをクリア
          intervalIds.forEach(id => clearInterval(id));
          intervalIds = [];
          activeCharacters = 0;
          
          // 既存のキャラクター要素を削除
          const container = document.querySelector(".chara-container");
          if (container) {
            const existingCharacters = container.querySelectorAll('.character');
            existingCharacters.forEach(char => char.remove());
          }
          
          // 少し遅延してから再初期化（レイアウトが安定してから）
          setTimeout(() => {
            initAnimations();
          }, 100);
        }
        
        lastWidth = currentWidth;
        lastHeight = currentHeight;
      }, 300);
    }
    
    window.addEventListener('resize', handleResizeEvent);
    // iOS Safariでの画面回転検出
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResizeEvent, 200);
    });
  }

  /**
   * 初期化処理
   */
  function init() {
    // DOMが完全に読み込まれた後に実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initAnimations();
        setupIntersectionObserver();
        handleResize();
      });
    } else {
      // DOMが既に読み込まれている場合
      initAnimations();
      setupIntersectionObserver();
      handleResize();
    }
  }

  // 初期化を実行
  init();

  // クリーンアップ処理
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    // すべてのインターバルをクリア
    intervalIds.forEach(id => clearInterval(id));
    intervalIds = [];
  });

  // ページが非表示になったときにアニメーションを停止
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isAnimating = false;
    } else {
      isAnimating = true;
    }
  });

})();