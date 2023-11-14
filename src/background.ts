// background.ts

type HeaderOperation = 'append' | 'set' | 'remove' | 'removeIfEmpty';

const ROUTING_KEY = "routingKey";
const ENABLED_KEY = "enabled";
const ROUTING_KEY_HEADER_KEY = "uberctx-sd-routing-key";

let inMemoryHeaderValue: string | undefined = undefined;
let inMemoryFeatureEnabled: boolean = false;

function updateDynamicRules() {
  if (inMemoryFeatureEnabled) {
    // Define the rule for modifying request headers.
    const rule: chrome.declarativeNetRequest.Rule = {
      "id": 1,
      "priority": 1,
      "action": {
        "type": chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        "requestHeaders": [
          {
            "header": ROUTING_KEY_HEADER_KEY,
            "operation": chrome.declarativeNetRequest.HeaderOperation.SET,
            "value": inMemoryHeaderValue || ''
          },
        ]
      },
      "condition": {
        "urlFilter": "*",
        "resourceTypes": [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
      }
    };

    // Update the dynamic rules
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        addRules: [rule], // Set the new rule
        removeRuleIds: [1] // Remove the previous rule
      }
    ).then(() => {
      // Adding console.log() to help with debugging (Should be fine to retain in published script)
      chrome.declarativeNetRequest.getDynamicRules().then(rules => {
        console.log(">> NEW DYNAMIC RULES: ", JSON.stringify(rules));
      })
    }).catch((error) => {
      console.log('>> Error updating dynamic rule:', error);
    });
  } else {
    // Remove the previously set rule
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1]
    });
  }
}

// This function is used to update the in-memory values from local storage
function updateInMemoryValues(): void {
  chrome.storage.local.get([ROUTING_KEY, ENABLED_KEY], (result) => {
    inMemoryHeaderValue = result[ROUTING_KEY];
    inMemoryFeatureEnabled = !!result[ENABLED_KEY];
    updateDynamicRules();
  });
}

// Initialize the in-memory value when the extension is installed/updated or when Chrome is started
chrome.runtime.onInstalled.addListener(() => updateInMemoryValues());
chrome.runtime.onStartup.addListener(() => updateInMemoryValues());

// Keep the in-memory value in sync with changes in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    let updated = false;
    if (changes[ROUTING_KEY]) {
      inMemoryHeaderValue = changes[ROUTING_KEY]?.newValue;
      updated = true;
    }
    if (changes[ENABLED_KEY]) {
      inMemoryFeatureEnabled = !!(changes[ENABLED_KEY]?.newValue);
      updated = true;
    }
    if (updated) {
      updateDynamicRules();
    }
  }
});
