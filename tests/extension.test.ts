import { StorageBrowserKeys } from '../src/contexts/StorageContext/browserKeys';

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
    onChanged: {
      addListener: jest.fn(),
    },
  },
  runtime: {
    onInstalled: {
      addListener: jest.fn(),
    },
    onStartup: {
      addListener: jest.fn(),
    },
  },
  declarativeNetRequest: {
    getDynamicRules: jest.fn(),
    updateDynamicRules: jest.fn(),
    ResourceType: {
      MAIN_FRAME: 'main_frame',
      SUB_FRAME: 'sub_frame',
      STYLESHEET: 'stylesheet',
      SCRIPT: 'script',
      IMAGE: 'image',
      FONT: 'font',
      OBJECT: 'object',
      XMLHTTPREQUEST: 'xmlhttprequest',
      PING: 'ping',
      CSP_REPORT: 'csp_report',
      MEDIA: 'media',
      WEBSOCKET: 'websocket',
      OTHER: 'other',
    },
    RuleActionType: {
      MODIFY_HEADERS: 'modifyHeaders',
    },
    HeaderOperation: {
      SET: 'set',
    },
  },
  webRequest: {
    onBeforeSendHeaders: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(() => false),
    },
  },
} as any;

describe('Browser Extension Compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('StorageBrowserKeys enum should be defined', () => {
    expect(StorageBrowserKeys.routingKey).toBe('routingKey');
    expect(StorageBrowserKeys.enabled).toBe('enabled');
    expect(StorageBrowserKeys.headers).toBe('headers');
    expect(StorageBrowserKeys.traceparentHeader).toBe('traceparentHeader');
  });

  test('Chrome service worker should use declarativeNetRequest', async () => {
    // Mock storage response
    (global.chrome.storage.local.get as jest.Mock).mockResolvedValue({
      [StorageBrowserKeys.enabled]: false,
      [StorageBrowserKeys.headers]: '[]',
      [StorageBrowserKeys.routingKey]: 'test-key',
    });

    (global.chrome.declarativeNetRequest.getDynamicRules as jest.Mock).mockResolvedValue([]);

    // Import chrome service worker
    await import('../src/service-worker');

    // Verify runtime listeners are set up
    expect(global.chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    expect(global.chrome.runtime.onStartup.addListener).toHaveBeenCalled();
  });

  test('Firefox service worker should use webRequest', async () => {
    // Mock storage response
    (global.chrome.storage.local.get as jest.Mock).mockResolvedValue({
      [StorageBrowserKeys.enabled]: false,
      [StorageBrowserKeys.headers]: '[]',
      [StorageBrowserKeys.routingKey]: 'test-key',
    });

    // Import firefox service worker
    await import('../src/service-worker-firefox');

    // Verify runtime listeners are set up
    expect(global.chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    expect(global.chrome.runtime.onStartup.addListener).toHaveBeenCalled();
  });

  test('Manifest files should exist and be different', () => {
    const fs = require('fs');
    const path = require('path');
    
    const chromeManifest = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../public/manifest.json'), 'utf8'
    ));
    
    const firefoxManifest = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../public/manifest_firefox.json'), 'utf8'
    ));

    // Chrome should be manifest v3
    expect(chromeManifest.manifest_version).toBe(3);
    expect(chromeManifest.permissions).toContain('declarativeNetRequest');
    expect(chromeManifest.background.service_worker).toBeDefined();

    // Firefox should be manifest v2
    expect(firefoxManifest.manifest_version).toBe(2);
    expect(firefoxManifest.permissions).toContain('webRequest');
    expect(firefoxManifest.permissions).toContain('webRequestBlocking');
    expect(firefoxManifest.background.scripts).toBeDefined();
    expect(firefoxManifest.browser_specific_settings.gecko).toBeDefined();
  });
});