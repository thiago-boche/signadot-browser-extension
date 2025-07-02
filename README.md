# Signadot Browser Extension

The Signadot Browser Extension simplifies testing web applications in sandbox environments by automatically injecting routing headers into browser requests.

# 🚀 Features
- Sandbox & Route Group Selection: Authenticate to view and select from a dropdown of available sandboxes and route groups.
- One-Click Toggle: Easily enable or disable routing to sandbox environments without altering code.
- Automatic Header Injection: Injects necessary headers like baggage, tracestate, and uberctx-sd-routing-key (as well as custom routing headers configured) to route traffic appropriately.

# 🛠️ Installation & Usage

- Install the extension from the Chrome Web Store: https://chromewebstore.google.com/detail/signadot/aigejiccjejdeiikegdjlofgcjhhnkim
- Log in to your Signadot account.
- Select the desired sandbox or route group from the extension dropdown.
- Toggle the extension to "ON" to start routing traffic through the selected entity.

## Development

### Setup
```
yarn install
```

### Build
```
yarn build
```

### Build in watch mode

#### terminal
```
npm run watch
```

### Load extension to chrome
Load `dist` directory

### Test
`npx jest` or `npm run test`
