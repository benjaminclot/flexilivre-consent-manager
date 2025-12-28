(function () {
  const COOKIE_DURATION_DAYS = 395; // 13 months for full consent
  const COOKIE_DURATION_DAYS_PARTIAL = 7; // 7 days for partial/no consent
  const SCRIPT_TAG = document.currentScript;
  const DOMAIN = SCRIPT_TAG.getAttribute('data-domain');

  let config = null;
  let consent = getConsentData();

  // Helper: Generate Token
  function generateToken() {
    try {
      const e = new Int8Array(26);
      crypto.getRandomValues(e);
      return function (e, t) {
        const n = [];
        for (let r = 0; r < t; ++r) {
          const t = (255 & e[r]) % 63;
          n.push("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-".charAt(t))
        }
        return n.join("")
      }(e, 26)
    } catch (e) {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  }

  // Helper: Inject CSS
  function injectCSS() {
    const css = `
#consent-manager-root { all: initial; position: fixed !important; z-index: 2147483647 !important; font-family: "Quicksand", Arial, sans-serif !important; font-size: 1em !important; color: #333 !important; line-height: 1.5 !important; box-sizing: border-box !important; }
#consent-manager-root * { box-sizing: border-box !important; }
.fcm-overlay { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; height: auto !important; background: transparent !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; justify-content: center !important; opacity: 0; visibility: hidden; margin: 0 !important; padding: 0 !important; border: none !important; z-index: 2147483647 !important; }
.fcm-overlay.fcm-visible { opacity: 1; visibility: visible; }
.fcm-modal { background: white !important; width: 100% !important; max-width: none !important; border-radius: 0 !important; box-shadow: 0 -4px 10px rgba(0,0,0,0.1) !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; max-height: 80vh !important; margin: 0 !important; padding: 0 !important; border: none !important; pointer-events: auto !important; }
@media (min-width: 450px) { .fcm-overlay { bottom: 20px !important; left: 20px !important; right: auto !important; width: auto !important; justify-content: flex-start !important; } .fcm-modal { width: 420px !important; border-radius: 12px !important; box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important; } }
.fcm-header { padding: 20px 20px 0 20px !important; background: transparent !important; }
.fcm-title { font-size: 1rem !important; font-weight: bold !important; margin: 0 0 10px 0 !important; color: #111 !important; line-height: 1.2 !important; }
.fcm-description { font-size: 0.85rem !important; color: #666 !important; margin: 0 !important; line-height: 1.5 !important; }
.fcm-body { padding: 0 20px 20px 20px !important; overflow-y: auto !important; background: transparent !important; }
.fcm-footer { background: #fff !important; border-top: 1px solid #eee !important; display: flex !important; flex-direction: row !important; }
.fcm-btn { font-family: "Quicksand", Arial, sans-serif !important; padding: 12px 20px !important; border: none !important; font-size: .85rem !important; cursor: pointer !important; font-weight: 600 !important; text-align: center !important; display: block !important; width: 100% !important; margin: 0 !important; text-decoration: none !important; line-height: normal !important; }
.fcm-btn-primary { background: #ea67a2 !important; color: white !important; }
.fcm-btn-secondary { background: #fff !important; color: #7a7a7a !important; font-weight: 400 !important; }
.fcm-btn-link { background: none !important; color: #6b7280 !important; font-size: .7rem !important; font-weight: 400 !important; margin: 12px auto !important; padding: 0 !important; text-decoration: underline !important; width: auto !important; }
.fcm-vendor-list { border: 1px solid #eee !important; border-radius: 8px !important; display: flex !important; flex-direction: column !important; gap: 0px !important; margin: 0 !important; padding: 0 !important; }
.fcm-vendor-item { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 10px 10px 10px 10px !important; margin: 0 !important; gap: 10px !important; }
.fcm-vendor-item + .fcm-vendor-item { border-top: 1px solid #eee !important; }
.fcm-vendor-info { display: flex !important; align-items: center !important; gap: 10px !important; }
.fcm-vendor-icon { width: 32px !important; height: 32px !important; min-width: 32px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
.fcm-vendor-icon svg { width: 100% !important; height: 100% !important; display: block !important; }
.fcm-vendor-text h4 { margin: 0 !important; font-size: .75rem !important; font-weight: 600 !important; color: #333 !important; }
.fcm-vendor-text p { margin: 0 !important; font-size: 0.75rem !important; color: #666 !important; line-height: 1.2 !important; }
.fcm-toggle { position: relative !important; display: inline-block !important; width: 50px !important; height: 26px !important; margin: 0 !important; padding: 0 !important; min-width: 50px !important; }
.fcm-toggle input { opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; position: absolute !important; }
.fcm-slider { position: absolute !important; cursor: pointer !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background-color: #ccc !important; transition: .2s !important; border-radius: 34px !important; border: none !important; }
.fcm-slider:before { position: absolute !important; content: "" !important; height: 20px !important; width: 20px !important; left: 3px !important; bottom: 3px !important; background-color: white !important; transition: .4s !important; border-radius: 50% !important; box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important; }
input:checked + .fcm-slider { background-color: #ea67a2 !important; }
input:checked + .fcm-slider:before { transform: translateX(24px) !important; }
input:disabled + .fcm-slider { opacity: 0.6 !important; cursor: not-allowed !important; }
.fcm-policy-link { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 16px !important; height: 16px !important; border-radius: 50% !important; background-color: #eee !important; color: #666 !important; font-size: 10px !important; font-weight: bold !important; text-decoration: none !important; transition: background-color 0.2s, color 0.2s !important; line-height: 10px !important; }
.fcm-text-link { color: #666 !important; font-size: 0.75rem !important; text-decoration: underline !important; margin-top: 10px !important; display: inline-block !important; }
.fcm-widget { position: fixed !important; bottom: 20px !important; left: 20px !important; width: 50px !important; height: 50px !important; background: white !important; border-radius: 50% !important; box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; z-index: 9998 !important; margin: 0 !important; padding: 0 !important; border: none !important; }
.fcm-widget svg { width: 24px !important; height: 24px !important; fill: #ea67a2 !important; display: block !important; }
        `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Helper: Get Root Domain
  function getRootDomain() {
    const parts = window.location.hostname.split('.');
    if (parts.length >= 2) {
      return '.' + parts.slice(-2).join('.');
    }
    return window.location.hostname;
  }

  // Helper: Set Cookie
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    const domain = getRootDomain();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;domain=" + domain + ";SameSite=Lax";
  }

  // Helper: Get Cookie
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Helper: Get Consent Data from JSON cookie
  function getConsentData() {
    const raw = getCookie('fcm_consent');
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch (e) {
      return null;
    }
  }

  // Helper: Migrate Axeptio cookie to FCM format
  function migrateAxeptioCookie(configVendorIds) {
    const raw = getCookie('axeptio_cookies');
    if (!raw) return null;
    try {
      const axeptio = JSON.parse(decodeURIComponent(raw));
      const vendors = [];
      
      // Extract vendor consents (keys that don't start with $$)
      // Only include vendors that exist in the config
      for (const key of Object.keys(axeptio)) {
        if (!key.startsWith('$$') && axeptio[key] === true) {
          const vendorId = key;
          if (configVendorIds.includes(vendorId)) {
            vendors.push(vendorId);
          }
        }
      }
      
      // Determine status based on vendors
      let status = 'none';
      if (vendors.length > 0) {
        // Check if all config vendors are consented
        status = (vendors.length === configVendorIds.length) ? 'full' : 'partial';
      }
      
      return {
        token: generateToken(),
        date: new Date().toISOString(),
        vendors: vendors,
        status: status
      };
    } catch (e) {
      return null;
    }
  }

  // Helper: Set Consent Data as JSON cookie
  function setConsentData(data, days) {
    const value = encodeURIComponent(JSON.stringify(data));
    setCookie('fcm_consent', value, days);
  }

  // Helper: Set authorized vendors cookie (both FCM and Axeptio)
  function setAuthorizedVendorsCookie(vendorList, days) {
    const cookieValue = vendorList.length > 0 ? ',' + vendorList.join(',') + ',' : ',,';
    setCookie('fcm_authorized_vendors', cookieValue, days);
    setCookie('axeptio_authorized_vendors', cookieValue, days);
  }

  // 1. Initialize
  function init() {
    injectCSS();

    // Load config from embedded CONFIGS (injected at build time)
    if (typeof CONFIGS === 'undefined') {
      console.error('Consent Manager: CONFIGS not found. Run build script first.');
      return;
    }

    // Try exact match first, then with dot prefix
    config = CONFIGS[DOMAIN];
    if (!config) {
      console.error('Consent Manager: Config not found for domain:', DOMAIN);
      return;
    }

    // Check Consent
    const configVendorIds = config.translations.vendors.map(v => v.id);
    const authorizedVendorsCookie = getCookie('fcm_authorized_vendors');

    // Re-read consent data (in case it was modified)
    consent = getConsentData();

    // Try to migrate from Axeptio cookie if no FCM consent exists
    if (!consent) {
      consent = migrateAxeptioCookie(configVendorIds);
      if (consent) {
        // Save migrated consent
        const cookieDuration = consent.status === 'full' ? COOKIE_DURATION_DAYS : COOKIE_DURATION_DAYS_PARTIAL;
        setConsentData(consent, cookieDuration);
        setAuthorizedVendorsCookie(consent.vendors, cookieDuration);
      }
    }

    // Show banner if no consent exists
    if (!consent) {
      renderModal('welcome');
      return;
    }

    // Sync fcm_authorized_vendors from fcm_consent (single source of truth)
    const expectedCookieValue = consent.vendors && consent.vendors.length > 0 
      ? ',' + consent.vendors.join(',') + ',' 
      : ',,';
    if (authorizedVendorsCookie !== expectedCookieValue) {
      const cookieDuration = consent.status === 'full' ? COOKIE_DURATION_DAYS : COOKIE_DURATION_DAYS_PARTIAL;
      setAuthorizedVendorsCookie(consent.vendors, cookieDuration);
    }

    if (consent.vendors && consent.vendors.length >= 0) {
      // Check if consent has expired based on status and date
      if (consent.date && consent.status !== 'full') {
        const consentTime = new Date(consent.date).getTime();
        const now = Date.now();
        const daysSinceConsent = (now - consentTime) / (1000 * 60 * 60 * 24);
        if (daysSinceConsent >= COOKIE_DURATION_DAYS_PARTIAL) {
          renderModal('welcome');
          return;
        }
      }

      // Build vendors object from array
      const vendors = {};
      consent.vendors.forEach(id => vendors[id] = true);

      // Remove vendors from consent that no longer exist in config
      const validVendorIds = consent.vendors.filter(id => configVendorIds.includes(id));
      const hadInvalidVendors = validVendorIds.length !== consent.vendors.length;
      
      if (hadInvalidVendors) {
        // Update cookies with only valid vendors
        consent.vendors = validVendorIds;
        const cookieDuration = consent.status === 'full' ? COOKIE_DURATION_DAYS : COOKIE_DURATION_DAYS_PARTIAL;
        setConsentData(consent, cookieDuration);
        setAuthorizedVendorsCookie(validVendorIds, cookieDuration);
      }

      // If user gave full consent, check if there are new vendors not in the cookie
      if (consent.status === 'full') {
        const hasNewVendors = configVendorIds.some(id => !vendors[id]);
        if (hasNewVendors) {
          renderModal('welcome');
          return;
        }
      }
    }
  }

  // 2. Render UI
  function renderModal(step) {
    let existing = document.getElementById('consent-manager-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'consent-manager-root';

    const t = config.translations;

    let content = '';

    if (step === 'welcome') {
      content = `
                <div class="fcm-overlay fcm-visible">
                    <div class="fcm-modal">
                        <div class="fcm-header">
                            <h2 class="fcm-title">${t.title}</h2>
                        </div>
                        <div class="fcm-body">
                            <p class="fcm-description">${t.description}</p>
                            ${t.policyUrl ? `<a href="${t.policyUrl}" target="_blank" class="fcm-text-link">${t.readPolicy || 'Privacy Policy'}</a>` : ''}
                        </div>
                        <div class="fcm-footer">
                            <button class="fcm-btn fcm-btn-secondary" id="fcm-configure">${t.configureButton}</button>
                            <button class="fcm-btn fcm-btn-primary" id="fcm-accept-all">${t.acceptButton}</button>
                        </div>
                    </div>
                    <button class="fcm-btn fcm-btn-link" id="fcm-continue">${t.continueWithoutAccepting}</button>
                </div>
            `;
    } else if (step === 'configure') {
      const vendorList = t.vendors.map(v => `
                <div class="fcm-vendor-item">
                    <div class="fcm-vendor-info">
                        <div class="fcm-vendor-icon">${v.favicon}</div>
                        <div class="fcm-vendor-text">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <h4>${v.name}</h4>
                                ${v.policyUrl ? `<a href="${v.policyUrl}" target="_blank" class="fcm-policy-link" title="Privacy Policy">?</a>` : ''}
                            </div>
                            <p>${v.description}</p>
                        </div>
                    </div>
                    <label class="fcm-toggle">
                        <input type="checkbox" class="fcm-vendor-checkbox" data-id="${v.id}" data-legitimate="${v.legitimate}"${v.legitimate ? ' checked disabled' : ''}>
                        <span class="fcm-slider"></span>
                    </label>
                </div>
            `).join('');

      content = `
                <div class="fcm-overlay fcm-visible">
                    <div class="fcm-modal">
                        <div class="fcm-header">
                            <h2 class="fcm-title">${t.configureButton}</h2>
                        </div>
                        <div class="fcm-body">
                            <div class="fcm-vendor-item" style="margin-bottom: 15px; border: none; background: transparent; padding: 0;">
                                <div class="fcm-vendor-info">
                                    <div class="fcm-vendor-text">
                                        <h4 style="font-size: 1.1rem;">${t.checkAllButton}</h4>
                                    </div>
                                </div>
                                <label class="fcm-toggle">
                                    <input type="checkbox" id="fcm-toggle-all">
                                    <span class="fcm-slider"></span>
                                </label>
                            </div>
                            <div class="fcm-vendor-list">
                                ${vendorList}
                            </div>
                        </div>
                        <div class="fcm-footer">
                            <button class="fcm-btn fcm-btn-secondary" id="fcm-back">${t.prevButton}</button>
                            <button class="fcm-btn fcm-btn-primary" id="fcm-accept-all-config">${t.acceptAllButton}</button>
                            <button class="fcm-btn fcm-btn-secondary" id="fcm-save">${t.endButton}</button>
                        </div>
                    </div>
                </div>
            `;
    }

    root.innerHTML = content;
    document.body.appendChild(root);

    // Event Listeners
    if (step === 'welcome') {
      document.getElementById('fcm-accept-all').onclick = () => saveConsent('full');
      document.getElementById('fcm-configure').onclick = () => renderModal('configure');
      document.getElementById('fcm-continue').onclick = () => saveConsent('none');
    } else if (step === 'configure') {
      document.getElementById('fcm-back').onclick = () => renderModal('welcome');

      // Toggle All Logic
      const toggleAll = document.getElementById('fcm-toggle-all');
      const checkboxes = document.querySelectorAll('.fcm-vendor-checkbox:not([disabled])');

      toggleAll.onchange = (e) => {
        checkboxes.forEach(cb => cb.checked = e.target.checked);
      };

      // Update Toggle All state if individual checkboxes change
      checkboxes.forEach(cb => {
        cb.onchange = () => {
          const allChecked = Array.from(checkboxes).every(c => c.checked);
          toggleAll.checked = allChecked;
        };
      });

      document.getElementById('fcm-accept-all-config').onclick = () => saveConsent('full');

      document.getElementById('fcm-save').onclick = () => {
        const consented = {};
        document.querySelectorAll('.fcm-vendor-checkbox').forEach(cb => {
          if (cb.checked) consented[cb.dataset.id] = true;
        });
        const hasAnyConsent = Object.keys(consented).length > 0;
        saveConsent(hasAnyConsent ? 'partial' : 'none', consented);
      };
    }
  }

  function closeModal() {
    let existing = document.getElementById('consent-manager-root');
    if (existing) existing.remove();
  }

  // 3. Logic
  function saveConsent(status, partialVendors = null) {
    const t = config.translations;
    let vendors = {};

    if (status === 'full') {
      t.vendors.forEach(v => vendors[v.id] = true);
    } else if (status === 'none') {
      t.vendors.forEach(v => vendors[v.id] = v.legitimate || false);
    } else {
      // For partial consent, always include legitimate vendors
      t.vendors.forEach(v => {
        if (v.legitimate) {
          vendors[v.id] = true;
        } else if (partialVendors && partialVendors[v.id] !== undefined) {
          vendors[v.id] = partialVendors[v.id];
        } else {
          vendors[v.id] = false;
        }
      });
    }

    // Save State to Cookies
    const cookieDuration = status === 'full' ? COOKIE_DURATION_DAYS : COOKIE_DURATION_DAYS_PARTIAL;
    const authorizedList = Object.keys(vendors).filter(k => vendors[k]);

    // 1. Main consent cookie (JSON with all data)
    consent = consent || {};
    consent.vendors = authorizedList;
    consent.status = status;
    consent.date = new Date().toISOString();
    if (!consent.token) consent.token = generateToken();
    setConsentData(consent, cookieDuration);

    // 2. Authorized Vendors List for tag manager (comma separated, wrapped in commas)
    setAuthorizedVendorsCookie(authorizedList, cookieDuration);

    closeModal();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public SDK
  window.fcm = {
    show: () => {
      if (config) {
        renderModal('welcome');
      } else {
        console.warn('Consent Manager: Config not loaded yet');
      }
    }
  };

})();
