// Storage keys
const STORAGE_KEY = 'trackedCookies';

// DOM elements
let domainElement, cookieNameInput, addCookieBtn, cookiesContainer, loadingElement;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  await loadTrackedCookies();
  setupEventListeners();
  await getCurrentDomain();
});

function initializeElements() {
  domainElement = document.getElementById('domain');
  cookieNameInput = document.getElementById('cookieNameInput');
  addCookieBtn = document.getElementById('addCookieBtn');
  cookiesContainer = document.getElementById('cookies-container');
  loadingElement = document.getElementById('loading');
}

function setupEventListeners() {
  addCookieBtn.addEventListener('click', addCookie);
  cookieNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCookie();
    }
  });
}

async function getCurrentDomain() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const url = new URL(tab.url);
      domainElement.textContent = url.hostname;
    }
  } catch (error) {
    console.error('Error getting current domain:', error);
    domainElement.textContent = 'Unable to detect domain';
  }
}

async function getTrackedCookieNames() {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Error getting tracked cookies from storage:', error);
    return [];
  }
}

async function saveTrackedCookieNames(cookieNames) {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: cookieNames });
  } catch (error) {
    console.error('Error saving tracked cookies to storage:', error);
  }
}

async function addCookie() {
  const cookieName = cookieNameInput.value.trim();

  if (!cookieName) {
    alert('Please enter a cookie name');
    return;
  }

  const trackedCookies = await getTrackedCookieNames();

  if (trackedCookies.includes(cookieName)) {
    alert('This cookie is already being tracked');
    return;
  }

  trackedCookies.push(cookieName);
  await saveTrackedCookieNames(trackedCookies);

  cookieNameInput.value = '';
  await loadTrackedCookies();
}

async function removeCookie(cookieName) {
  const trackedCookies = await getTrackedCookieNames();
  const updatedCookies = trackedCookies.filter(name => name !== cookieName);

  await saveTrackedCookieNames(updatedCookies);
  await loadTrackedCookies();
}

async function getCurrentTabCookies() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
      return [];
    }

    const url = new URL(tab.url);
    const cookies = await chrome.cookies.getAll({ url: tab.url });

    return cookies;
  } catch (error) {
    console.error('Error getting cookies:', error);
    return [];
  }
}

async function loadTrackedCookies() {
  loadingElement.style.display = 'block';
  cookiesContainer.innerHTML = '';

  try {
    const trackedCookieNames = await getTrackedCookieNames();

    if (trackedCookieNames.length === 0) {
      cookiesContainer.innerHTML = '<div class="no-cookies">No cookies being tracked. Add some cookie names above!</div>';
      loadingElement.style.display = 'none';
      return;
    }

    const currentCookies = await getCurrentTabCookies();
    const cookieMap = new Map(currentCookies.map(cookie => [cookie.name, cookie]));

    trackedCookieNames.forEach(cookieName => {
      const cookie = cookieMap.get(cookieName);
      const cookieElement = createCookieElement(cookieName, cookie);
      cookiesContainer.appendChild(cookieElement);
    });

  } catch (error) {
    console.error('Error loading tracked cookies:', error);
    cookiesContainer.innerHTML = '<div class="no-cookies">Error loading cookies</div>';
  }

  loadingElement.style.display = 'none';
}

function createCookieElement(cookieName, cookie) {
  const cookieDiv = document.createElement('div');
  const isFound = !!cookie;

  cookieDiv.className = `cookie-item ${isFound ? 'found' : 'not-found'}`;

  cookieDiv.innerHTML = `
    <div class="cookie-header">
      <div class="cookie-name">${escapeHtml(cookieName)}</div>
      <div class="cookie-buttons">
        ${isFound ? `<button class="copy-btn" data-cookie-value="${escapeHtml(cookie.value)}">Copy</button>` : ''}
        <button class="remove-btn" data-cookie-name="${escapeHtml(cookieName)}">Remove</button>
      </div>
    </div>
    ${isFound ? `
      <div class="cookie-value">${escapeHtml(cookie.value)}</div>
      <div class="cookie-status found">✓ Found on this domain</div>
    ` : `
      <div class="cookie-status not-found">⚠ Not found on this domain</div>
    `}
  `;

  // Add event listener for copy button
  const copyBtn = cookieDiv.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const cookieValue = e.target.dataset.cookieValue;
      try {
        await navigator.clipboard.writeText(cookieValue);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      } catch (error) {
        console.error('Failed to copy cookie value:', error);
        copyBtn.textContent = 'Failed';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      }
    });
  }

  // Add event listener for remove button
  const removeBtn = cookieDiv.querySelector('.remove-btn');
  removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    removeCookie(cookieName);
  });

  return cookieDiv;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}