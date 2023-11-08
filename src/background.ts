// background.ts

const ROUTING_KEY = "routingKey";
const ENABLED = "enabled";
const ROUTING_KEY_HEADER_KEY = "uberctx-sd-routing-key";

let inMemoryHeaderValue: string | undefined = undefined;
let inMemoryFeatureEnabled: boolean = false;

// This function is used to update the in-memory values from local storage
function updateInMemoryValues(caller: string): void {
  chrome.storage.local.get([ROUTING_KEY, ENABLED], (result) => {
    inMemoryHeaderValue = result[ROUTING_KEY];
    inMemoryFeatureEnabled = !!result[ENABLED];
  });
}

// Initialize the in-memory value when the extension is installed/updated or when Chrome is started
chrome.runtime.onInstalled.addListener(() => updateInMemoryValues("onInstalled"));
chrome.runtime.onStartup.addListener(() => updateInMemoryValues("onStartup"));

// Keep the in-memory value in sync with changes in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes[ROUTING_KEY]) {
      inMemoryHeaderValue = changes[ROUTING_KEY]?.newValue;
    }
    if (changes[ENABLED]) {
      inMemoryFeatureEnabled = !!(changes[ENABLED]?.newValue);
    }
  }
});

// This listener modifies the request headers using the in-memory API key
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const requestHeaders = details.requestHeaders || [];

    if (inMemoryHeaderValue && inMemoryFeatureEnabled) {
      const headerIndex = requestHeaders.findIndex(header => header.name.toLowerCase() === ROUTING_KEY_HEADER_KEY);
      if (headerIndex !== -1) {
        requestHeaders[headerIndex].value = inMemoryHeaderValue;
      } else {
        requestHeaders.push({ name: ROUTING_KEY_HEADER_KEY, value: inMemoryHeaderValue });
      }
    }
    return { requestHeaders };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders', 'extraHeaders']
);
