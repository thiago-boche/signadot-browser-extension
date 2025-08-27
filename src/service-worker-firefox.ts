// Firefox-specific service worker using webRequest API
// This is necessary because Firefox has limited declarativeNetRequest support

import { getBrowserStoreValues, StorageBrowserKeys } from "./contexts/StorageContext/browserKeys";

// Firefox uses webRequest API for header modification
let currentHeaders: Array<[string, string]> = [];
let isEnabled = false;

const onBeforeSendHeaders = (details: chrome.webRequest.WebRequestHeadersDetails) => {
  if (!isEnabled || !currentHeaders.length) {
    return {};
  }

  // Skip Signadot preview domains
  const excludedDomains = ["preview.signadot.com", "preview.staging.signadot.com", "localhost.signadot.com"];
  const url = new URL(details.url);
  if (excludedDomains.some(domain => url.hostname.includes(domain))) {
    return {};
  }

  // Add/modify headers
  const requestHeaders = details.requestHeaders || [];
  
  for (const [key, value] of currentHeaders) {
    // Remove existing header if present
    const existingIndex = requestHeaders.findIndex(h => h.name?.toLowerCase() === key.toLowerCase());
    if (existingIndex >= 0) {
      requestHeaders.splice(existingIndex, 1);
    }
    // Add new header
    requestHeaders.push({ name: key, value: value });
  }

  return { requestHeaders };
};

async function updateHeaders() {
  const values = await getBrowserStoreValues([
    StorageBrowserKeys.routingKey,
    StorageBrowserKeys.enabled,
    StorageBrowserKeys.headers,
    StorageBrowserKeys.traceparentHeader,
  ]);

  const { routingKey, enabled, headers, traceparentHeader } = values;
  const shouldInjectHeaders = headers && headers.length > 0 && enabled && routingKey;

  if (!shouldInjectHeaders) {
    isEnabled = false;
    currentHeaders = [];
    
    // Remove existing listener
    if (chrome.webRequest.onBeforeSendHeaders.hasListener(onBeforeSendHeaders)) {
      chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
    }
    
    console.log("Header injection disabled.");
    return;
  }

  try {
    currentHeaders = JSON.parse(headers);
    isEnabled = true;

    // Remove existing listener first
    if (chrome.webRequest.onBeforeSendHeaders.hasListener(onBeforeSendHeaders)) {
      chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
    }

    // Add new listener
    chrome.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders,
      { urls: ["<all_urls>"] },
      ["requestHeaders", "blocking"]
    );

    console.log("Header injection enabled with headers:", currentHeaders);
  } catch (error) {
    console.error("Error parsing headers:", error);
    isEnabled = false;
    currentHeaders = [];
  }
}

chrome.runtime.onInstalled.addListener(updateHeaders);
chrome.runtime.onStartup.addListener(updateHeaders);
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log({ changes, areaName });

  if (
    areaName === "local" &&
    (changes[StorageBrowserKeys.headers] ||
      changes[StorageBrowserKeys.routingKey] ||
      changes[StorageBrowserKeys.enabled] ||
      changes[StorageBrowserKeys.traceparentHeader])
  ) {
    updateHeaders();
  }
});