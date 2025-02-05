```markdown
# frontend-vue staging

This template helps you get started developing with Vue 3 in Vite. The app is designed to follow modern best practices, including Content Security Policy (CSP) compliance and optimized for local development and production.

---

## 🚀 Features
- Vue 3 with Vite for fast builds and hot module replacement.
- Content Security Policy (CSP) compliance for enhanced security.
- Nightwatch for end-to-end and component testing.
- ESLint for linting and code quality.
- TypeScript support (optional, if added).

---

## 📂 Project Structure
```plaintext
src/
  assets/          # Static assets like images, fonts, etc.
  components/      # Reusable Vue components
  views/           # Page-level components
  router/          # Vue Router configuration
  store/           # State management (Pinia, if used)
  composables/     # Custom hooks and composables
  App.vue          # Root Vue component
  main.js          # App entry point
```

---

## Recommended IDE Setup
Use [VSCode](https://code.visualstudio.com/) with [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

---

## 📦 Project Setup

### Install Dependencies
```sh
npm install
```

### Compile and Hot-Reload for Development
```sh
npm run dev
```

### Compile and Minify for Production
```sh
npm run build
```

---

## 🧪 Testing

### Run End-to-End Tests with [Nightwatch](https://nightwatchjs.org/)
```sh
# When using CI, the project must be built first.
npm run build

# Run all end-to-end tests
npm run test:e2e

# Run tests only on Chrome
npm run test:e2e -- --env chrome

# Run a specific test file
npm run test:e2e -- tests/e2e/example.js

# Run tests in debug mode
npm run test:e2e -- --debug
```

### Run Headed Component Tests with [Nightwatch Component Testing](https://nightwatchjs.org/guide/component-testing/introduction.html)
```sh
npm run test:unit
npm run test:unit -- --headless # for headless testing
```

---

## 🔒 Content Security Policy (CSP)

To ensure CSP compliance:
1. Avoid inline scripts and styles.
2. Use external files for JavaScript and CSS.
3. Set the following CSP headers in your web server:
   ```http
   Content-Security-Policy:
     default-src 'self';
     script-src 'self' 'nonce-<unique-value>';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data:;
     font-src 'self';
     connect-src 'self';
     frame-src 'none';
     object-src 'none';
   ```

---

## 🛠 Linting and Formatting

### Lint with [ESLint](https://eslint.org/)
```sh
npm run lint
```

---

## 📄 Customize Configuration
See [Vite Configuration Reference](https://vite.dev/config/).

---

## 🛠 Additional Notes

### Custom Port
To run the app on a custom port, update the `vite.config.js` file:
```javascript
server: {
  port: 3000,
},
```

### Expose to Local Network
Run the app with:
```sh
npm run dev -- --host
```
You can access the app from other devices on your network using your local IP.

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

---

## 📄 License
This project is licensed under the MIT License.
```
