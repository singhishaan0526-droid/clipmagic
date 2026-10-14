// =============================================================================
// CLIP MAGIC — Cookie Consent & Privacy-First Tracking Manager
// =============================================================================

(function () {
  const STORAGE_KEY = 'cm-cookie-consent-v2';

  function getConsent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...consent,
        timestamp: new Date().toISOString()
      }));
      window.dispatchEvent(new CustomEvent('cm:cookie-consent-updated', { detail: consent }));
      applyConsentSettings(consent);
    } catch (e) {}
  }

  function applyConsentSettings(consent) {
    if (consent && consent.analytics) {
      initPrivacyAnalytics();
    }
  }

  // Privacy-preserving anonymous analytics runner (only loaded after explicit consent)
  function initPrivacyAnalytics() {
    if (window._cmAnalyticsInitialized) return;
    window._cmAnalyticsInitialized = true;

    // Plausible / Minimal privacy-friendly analytics snippet hook
    const analyticsId = document.querySelector('meta[name="analytics-id"]')?.content;
    if (analyticsId && analyticsId !== 'UA-XXXXX-Y') {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.dataset.domain = window.location.hostname;
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }
  }

  function removeBanner() {
    const el = document.getElementById('cmCookieConsentBanner');
    if (el) el.remove();
  }

  function removeModal() {
    const el = document.getElementById('cmCookieCustomizeModal');
    if (el) el.remove();
  }

  function showBanner() {
    if (document.getElementById('cmCookieConsentBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'cmCookieConsentBanner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie and privacy preferences');
    banner.innerHTML = `
      <style>
        #cmCookieConsentBanner {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 680px;
          background: rgba(14, 18, 30, 0.94);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15);
          z-index: 99999;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #f1f5f9;
          animation: cmSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cmSlideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .cm-cc-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cm-cc-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .cm-cc-desc a {
          color: #38bdf8;
          text-decoration: underline;
        }
        .cm-cc-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .cm-cc-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .cm-cc-btn-primary {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
        }
        .cm-cc-btn-primary:hover {
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
          transform: translateY(-1px);
        }
        .cm-cc-btn-secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .cm-cc-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
        }
        .cm-cc-btn-ghost {
          background: transparent;
          color: #94a3b8;
          text-decoration: underline;
          padding: 8px 10px;
        }
        .cm-cc-btn-ghost:hover {
          color: #f1f5f9;
        }
      </style>
      <div class="cm-cc-title">
        <span>🍪</span>
        <span>Your Privacy & Cookie Choices</span>
      </div>
      <div class="cm-cc-desc">
        We use essential browser storage for local video editing projects and theme preferences. With your consent, we also use privacy-first anonymous analytics to improve video rendering performance. Learn more in our <a href="privacy.html">Privacy Policy</a>.
      </div>
      <div class="cm-cc-actions">
        <button class="cm-cc-btn cm-cc-btn-primary" id="cmBtnAcceptAll">Accept All</button>
        <button class="cm-cc-btn cm-cc-btn-secondary" id="cmBtnReject">Essential Only</button>
        <button class="cm-cc-btn cm-cc-btn-ghost" id="cmBtnCustomize">Customize</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('cmBtnAcceptAll').onclick = () => {
      saveConsent({ essential: true, analytics: true });
      removeBanner();
    };

    document.getElementById('cmBtnReject').onclick = () => {
      saveConsent({ essential: true, analytics: false });
      removeBanner();
    };

    document.getElementById('cmBtnCustomize').onclick = () => {
      removeBanner();
      openCustomizeModal();
    };
  }

  function openCustomizeModal() {
    removeModal();
    const current = getConsent() || { essential: true, analytics: false };

    const modal = document.createElement('div');
    modal.id = 'cmCookieCustomizeModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cmCustTitle');
    modal.innerHTML = `
      <style>
        #cmCookieCustomizeModal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100000;
        }
        .cm-modal-box {
          background: #0f1322;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          max-width: 540px;
          width: 100%;
          padding: 28px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
          font-family: 'Inter', -apple-system, sans-serif;
          color: #f1f5f9;
        }
        .cm-cat-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .cm-cat-title {
          font-weight: 700;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        .cm-cat-desc {
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.4;
        }
      </style>
      <div class="cm-modal-box">
        <h2 id="cmCustTitle" style="font-family:'Outfit',sans-serif; font-size:1.35rem; margin-bottom:12px;">Cookie Preferences</h2>
        <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:20px;">
          Configure granular consent settings below. Essential storage cannot be disabled as it powers video decoding and timeline state.
        </p>

        <div class="cm-cat-item">
          <div>
            <div class="cm-cat-title">Essential Storage (Required)</div>
            <div class="cm-cat-desc">Stores timeline keyframes, audio sync, color grade presets, and theme settings locally on your machine.</div>
          </div>
          <input type="checkbox" checked disabled style="accent-color:#a855f7; transform:scale(1.2); margin-top:4px;" />
        </div>

        <div class="cm-cat-item">
          <div>
            <div class="cm-cat-title">Anonymous Analytics</div>
            <div class="cm-cat-desc">Privacy-preserving, cookie-free aggregated telemetry to monitor video export reliability and browser memory usage.</div>
          </div>
          <input type="checkbox" id="cmCustAnalyticsCheck" ${current.analytics ? 'checked' : ''} style="accent-color:#a855f7; transform:scale(1.2); margin-top:4px; cursor:pointer;" />
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:24px;">
          <button class="cm-cc-btn cm-cc-btn-secondary" id="cmCustCancel">Cancel</button>
          <button class="cm-cc-btn cm-cc-btn-primary" id="cmCustSave">Save Preferences</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cmCustCancel').onclick = removeModal;
    document.getElementById('cmCustSave').onclick = () => {
      const analytics = document.getElementById('cmCustAnalyticsCheck').checked;
      saveConsent({ essential: true, analytics });
      removeModal();
    };
  }

  // Global trigger accessible from footer links
  window.openCookieSettings = function (e) {
    if (e) e.preventDefault();
    openCustomizeModal();
  };

  // Initialization check
  document.addEventListener('DOMContentLoaded', () => {
    const consent = getConsent();
    if (!consent) {
      setTimeout(showBanner, 800);
    } else {
      applyConsentSettings(consent);
    }

    // Attach to any cookie preference buttons
    document.querySelectorAll('.cm-cookie-pref-btn, #cookiePrefBtn').forEach(btn => {
      btn.addEventListener('click', window.openCookieSettings);
    });
  });
})();
