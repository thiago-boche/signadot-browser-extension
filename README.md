# Signadot Browser Extension

The Signadot Browser Extension simplifies testing web applications in sandbox environments by automatically injecting routing headers into browser requests.

# 🚀 Features
- Sandbox & Route Group Selection: Authenticate to view and select from a dropdown of available sandboxes and route groups.
- One-Click Toggle: Easily enable or disable routing to sandbox environments without altering code.
- Automatic Header Injection: Injects necessary headers like baggage and tracestate (as well as custom routing headers configured) to route traffic appropriately.

# 🛠️ Installation & Usage

## Chrome
- Install the extension from the Chrome Web Store: https://chromewebstore.google.com/detail/signadot/aigejiccjejdeiikegdjlofgcjhhnkim

## Firefox
- Install the Firefox version from the Firefox Add-ons store: (Firefox add-on link TBD)
- Alternatively, load the extension manually:
  1. Build the Firefox version: `npm run build:firefox`
  2. Open Firefox and navigate to `about:debugging`
  3. Click "This Firefox" 
  4. Click "Load Temporary Add-on"
  5. Select the `manifest.json` file from the `dist-firefox` directory

## Usage
- Log in to your Signadot account.
- Select the desired sandbox or route group from the extension dropdown.
- Toggle the extension to "ON" to start routing traffic through the selected entity.

Check out [the docs](https://www.signadot.com/docs/guides/developer-environments/access-sandboxes) for more information.

## Browser Differences

### Chrome Version
- Uses Manifest V3
- Uses `declarativeNetRequest` API for efficient header injection
- Service worker background script
- Built to `dist-chrome/` directory

### Firefox Version  
- Uses Manifest V2
- Uses `webRequest` API with blocking requests for header injection
- Traditional background script (not service worker)
- Built to `dist-firefox/` directory
- Requires additional permissions: `webRequest`, `webRequestBlocking`

Both versions provide identical functionality but use browser-appropriate APIs for maximum compatibility and performance.

## Development

### Setup
```
yarn install
```

### Build

Build Chrome version:
```
yarn build
```

Build Firefox version:
```
yarn build:firefox
```

Build both versions:
```
yarn build:all
```

### Build in watch mode

#### terminal
```
npm run watch
```

For Firefox development:
```
npm run watch:firefox
```

### Load extension to browsers

#### Chrome
Load `dist-chrome` directory

#### Firefox  
Load `dist-firefox` directory via `about:debugging` → "This Firefox" → "Load Temporary Add-on"

### Test
`npx jest` or `npm run test`
