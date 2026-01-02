# WipeMyMail - Vanilla JS Frontend

Ultra-fast, lightweight temporary email service frontend built with pure HTML, CSS, and JavaScript.

## 🚀 Performance

- **Bundle Size**: ~30KB gzipped (vs 500KB+ with React)
- **Load Time**: < 1s on 3G networks
- **Lighthouse Score**: 95+ (target)
- **Zero Build Step**: No compilation required

## 📦 What's Included

- `index.html` - Main HTML with inline critical CSS
- `css/styles.css` - Complete stylesheet (~8KB)
- `js/api.js` - API service layer
- `js/ui.js` - UI helper functions
- `js/app.js` - Main application logic

## 🛠️ Technologies

- **Vanilla JavaScript** (ES6+)
- **CSS3** with custom properties
- **Native Fetch API** for HTTP requests
- **DOMPurify** for XSS protection (CDN)
- **QRCode.js** for QR generation (CDN)
- **postal-mime** for email parsing (CDN)

## ⚡ Features

✅ Instant email generation  
✅ Real-time inbox updates (10s polling)  
✅ Copy to clipboard  
✅ QR code display  
✅ 24-hour countdown timer  
✅ Domain selection  
✅ Email viewer with HTML sanitization  
✅ Responsive design (mobile-first)  
✅ FAQ accordion  
✅ Dark theme  

## 🚫 Removed from React Version

- Heavy animations (framer-motion)
- Socket.io client (replaced with polling)
- Web fonts (using system fonts)
- Tailwind CSS build
- React/ReactDOM bundles

## 🔧 Local Development

No build step required! Just serve with any static server:

```bash
# Python 3
python -m http.server 8080

# Node.js (http-server)
npx http-server -p 8080

# PHP
php -S localhost:8080
```

Then open http://localhost:8080

## 📈 Deployment

Simply upload all files to your web server or CDN. No build process needed.

```bash
# Example: Deploy to GitHub Pages
git subtree push --prefix frontend-vanilla origin gh-pages
```

## 🔐 Security

- HTML sanitization via DOMPurify
- HTTPS API calls
- No inline scripts (CSP-ready)
- No third-party trackers

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android)

## 📝 API Configuration

Update the API endpoint in `js/api.js`:

```javascript
const API_BASE = 'https://temp-email-api.teleflix.online';
```

## 🎨 Customization

All theme colors are defined as CSS variables in `css/styles.css`:

```css
:root {
    --primary: #7c3aed;
    --bg: #0c0c0c;
    --text: #ffffff;
    /* ... */
}
```

## 📊 Performance Comparison

| Metric | React Version | Vanilla JS |
|--------|--------------|-----------|
| Bundle Size | ~500KB | ~30KB |
| Initial Load | 2-3s | <1s |
| Dependencies | 15+ | 3 (CDN) |
| Build Time | ~10s | 0s |

## 🤝 Contributing

This is a minimal, performance-focused implementation. Keep PRs focused on:
- Performance improvements
- Bug fixes
- Accessibility enhancements

Avoid adding heavy dependencies or features that bloat the bundle.

## 📄 License

Same as parent project
