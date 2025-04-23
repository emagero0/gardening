# Automated Vertical Garden Web App - Project Context

## 1. Project Overview
### Core Functionality
- Real-time sensor monitoring (soil moisture, temperature, humidity, NPK)
- Manual/Automatic irrigation control
- Alert system for critical conditions
- Historical data visualization (charts/graphs)
- User authentication with persistent login
- Settings for thresholds and preferences
- Offline support with PWA capabilities

### Target Audience
- Urban farmers and gardeners
- **Primary device**: Mobile phones (80%+ usage)
- Secondary devices: Tablets/desktops

---

## 2. Design Guidelines
### Visual Identity
**Color Scheme**  
`#2d5a27` (Forest Green) • `#7cb342` (Apple Green) • `#f5f5f5` (Light Grey)  
**Typography**  
- Primary: `Inter` (Clean, modern sans-serif)  
- Secondary: `Roboto Mono` (Data displays)  
**Icons**  
- Material Design Icons (Google)  
- Heroicons (Tailwind-compatible)

### UI Patterns
- **Dashboard Layout**: Card-based grid system
- **Mobile First**: Bottom navigation bar
- **Dark Mode**: Toggle with CSS variables
- **Animations**: Micro-interactions using Framer Motion
- **Offline UI**: Clear offline state indicators

---

## 3. Technical Specifications
### Frontend Stack
```javascript
{
  "framework": "React.js (v18+)",
  "styling": "Tailwind CSS v3.3+",
  "charts": "Recharts (React-optimized)",
  "state": "Context API + useReducer",
  "auth": "Firebase Authentication (OAuth2)",
  "real-time": "WebSocket (via Socket.io)",
  "offline": "PWA with Service Workers"
}
```

### Why WebSocket over SSE?
1. Bi-directional communication (send/receive irrigation commands)
2. Lower latency for control actions
3. Better error handling
4. Native React support through Socket.io

### Offline Capabilities
1. **Service Worker**:
   - Caches static assets (UI shell)
   - Stores recent sensor data
   - Manages background sync

2. **IndexedDB**:
   - Local data persistence
   - Offline readings history
   - Pending actions queue

3. **Sync Strategy**:
   - Background sync for queued actions
   - Automatic retry on reconnection
   - Conflict resolution handling

---

## 4. User Flow & Wireframes
### Key Screens
1. **Login/Register**  
   - Social auth buttons (Google/GitHub)
   - "Remember me" checkbox

2. **Dashboard** (Mobile View)  
```plaintext
[Header: Garden Status]
[Card: Soil Moisture 65%] [Card: Temp 24°C]
[Card: Irrigation Controls]
[Bottom Nav: Dashboard | History | Alerts | Settings]
```

3. **History Page**  
   - Time-range filters (24h/7d/30d)
   - Interactive Line Chart (Recharts)

4. **Alert System**  
   - Color-coded priority badges
   - Push notification integration

---

## 5. Security & Accessibility
### Implementation Plan
```yaml
authentication:
  provider: Firebase
  session: "30-day refresh tokens"
  security:
    - HTTPS enforced
    - CSRF tokens
    - Passwordless option
    - Offline token persistence

accessibility:
  - WCAG 2.1 AA compliance
  - Screen reader labels
  - Keyboard navigation
  - Contrast ratio ≥ 4.5:1

offline_security:
  - Encrypted local storage
  - Secure credential caching
  - Action audit trail
```

---

## 6. Development Setup
### Recommended Workflow
1. **Wireframing**: Figma ([Mobile-first template](https://www.figma.com/community/file/1234567890))
2. **Local Setup**:
```bash
npx create-react-app garden-app --template typescript
npm install @framer-motion @reduxjs/toolkit firebase socket.io-client recharts
```
3. **PWA Setup**:
```bash
npm install @vite-pwa/vite
# Configure service worker and manifest
```
4. **Theming**:
```css
/* tailwind.config.js */
theme: {
  colors: {
    primary: '#2d5a27',
    secondary: '#7cb342',
    dark: '#1a1a1a'
  }
}
```

### Modern UI Features
- **Dark Mode**: CSS variables + localStorage
- **Animations**:
```jsx
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```
- **Offline States**:
```jsx
<ConnectionStatus>
  {isOffline ? "Working Offline" : "Connected"}
</ConnectionStatus>
```

---

## 7. Deployment Strategy
**Recommended Host**: Vercel (Optimized for React)  
**CI/CD**: GitHub Actions  
**Monitoring**: Sentry (Error tracking)  
**PWA Assets**: CDN-cached with versioning

---

> **Next Steps**:  
> 1. Create Figma wireframes  
> 2. Set up base React project  
> 3. Implement auth flow  
> 4. Develop dashboard prototype  
> 5. Configure PWA and offline support
