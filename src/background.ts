// background.ts

const ROUTING_KEY = "routingKey";
const ENABLED_KEY = "enabled";
const ROUTING_HEADER_KEYS: string[] = [
  "uberctx-sd-workspace",
  "uberctx-sd-sandbox",
  "uberctx-sd-routing-key",
  "uberctx-sd-request-id",
  "ot-baggage-sd-workspace",
  "ot-baggage-sd-sandbox",
  "ot-baggage-sd-routing-key",
  "ot-baggage-sd-request-id",
  "baggage",
  "sd-workspace",
  "sd-sandbox",
  "sd-routing-key",
  "sd-request-id",
  "tracestate",
  "sd-workspace",
  "sd-sandbox",
  "sd-routing-key",
  "sd-request-id",
];
const ResourceType = chrome.declarativeNetRequest.ResourceType;
const MODIFY_HEADER_IN_RESOURCE_TYPES: string[] = [
  ResourceType.MAIN_FRAME,
  ResourceType.SUB_FRAME,
  ResourceType.STYLESHEET,
  ResourceType.SCRIPT,
  ResourceType.IMAGE,
  ResourceType.FONT,
  ResourceType.OBJECT,
  ResourceType.XMLHTTPREQUEST,
  ResourceType.PING,
  ResourceType.CSP_REPORT,
  ResourceType.MEDIA,
  ResourceType.WEBSOCKET,
  ResourceType.OTHER
]

let inMemoryHeaderValue: string | undefined = undefined;
let inMemoryFeatureEnabled: boolean = false;

function debug(fn: string, ref?: string, data?: any) {
  console.log(`>>> [${fn}] Enabled: ${inMemoryFeatureEnabled ? "true": "false"}, RoutingKey: ${inMemoryHeaderValue}: ${ref} ${data}`)
}

const getRules = (
  headerKeys: string[],
  value: string
): chrome.declarativeNetRequest.Rule[] =>
  headerKeys.map(
    (key, idx) =>
      ({
        id: idx + 1,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: key,
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: value,
            },
          ],
        },
        condition: {
          urlFilter: "*",
          resourceTypes: MODIFY_HEADER_IN_RESOURCE_TYPES,
        },
      } as chrome.declarativeNetRequest.Rule)
  );

const getCurrentRuleIDs = (
  rules: chrome.declarativeNetRequest.Rule[]
): number[] => rules.map((rule) => rule.id);

async function updateDynamicRules() {
  debug("updateDynamicRules() - start")
  debug(`updateDynamicRules();inMemoryFeatureEnabled=${inMemoryFeatureEnabled ? "true": "false"}`)
  if (inMemoryFeatureEnabled) {
    const rules = getRules(ROUTING_HEADER_KEYS, inMemoryHeaderValue || "");
    debug("updateDynamicRules()", "rules-count", rules.length)
    // Update the dynamic rules
    chrome.declarativeNetRequest
      .updateDynamicRules({
        // Set the new rules
        addRules: rules,

        // Remove the previous rules
        removeRuleIds: getCurrentRuleIDs(
          await chrome.declarativeNetRequest.getDynamicRules()
        ),
      })
      .then(() => {
        // Adding console.log() to help with debugging (Should be fine to retain in published script)
        chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
          console.log(">> NEW DYNAMIC RULES: ", rules);
        });
      })
      .catch((error) => {
        console.log(">> Error updating dynamic rule:", error);
      });
  } else {
    // Remove the previously set rule
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: getCurrentRuleIDs(
        await chrome.declarativeNetRequest.getDynamicRules()
      ),
    });
  }
  debug("updateDynamicRules() - end")
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
chrome.runtime.onInstalled.addListener(() => {
  debug("onInstalled - before");
  updateInMemoryValues()
  debug("onInstalled - after");
});
chrome.runtime.onStartup.addListener(() => {
  debug("onStartup - before");
  updateInMemoryValues()
  debug("onStartup - before");
});

// Keep the in-memory value in sync with changes in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  debug("onChanged() - start");
  if (areaName === "local") {
    debug("onChanged();local=true", "changes", JSON.stringify(changes));
    let updated = false;
    if (ROUTING_KEY in changes) {
      inMemoryHeaderValue = changes[ROUTING_KEY]?.newValue;
      debug("onChanged();local=true;hasRoutingKey", "inMemoryHeaderValue", inMemoryHeaderValue);
      updated = true;
    }
    if (ENABLED_KEY in changes) {
      inMemoryFeatureEnabled = !!changes[ENABLED_KEY]?.newValue;
      debug("onChanged();local=true;hasEnabled", "inMemoryFeatureEnabled", inMemoryFeatureEnabled);
      updated = true;
    }
    debug(`onChanged();local=true;updated=${updated ? "true": "false"}`);
    if (updated) {
      updateDynamicRules();
    }
  }
  debug("onChanged() - end");
});

debug("outside");
updateInMemoryValues();
