# SkyScape — Immersive Real-Time 3D Weather Experience

**SkyScape** is a production-quality, real-time 3D weather web application built with React, Vite, Three.js (`@react-three/fiber` & `@react-three/drei`), Recharts, Framer Motion, and Glassmorphic CSS.

---

## 🌟 Key Features

### 1. Core 3D Atmospheric Experience
- **Dynamic 3D Sky & Environment**:
  - **Sun with Solar Flare**: Procedural glowing corona. Clicking the sun triggers an Easter egg bounce and celebration confetti!
  - **Moon with Procedural Craters**: Dynamic luminescence and crater markers.
  - **Day/Night Cycle**: Solar position arcs across the sky in real-time according to the selected city's exact sunrise and sunset times.
  - **Weather-Driven Particle Systems**:
    - **Rain**: Falling rain with ground splash ripples.
    - **Snow**: Drifting, oscillating snowflakes with wind sway.
    - **Fog**: Volumetric mist layers.
    - **Thunderstorm**: Lightning flash bursts with atmospheric ambient illumination.
    - **Volumetric Clouds**: Multi-sphere instanced cloud puffs drifting with live wind velocity.
  - **Interactive 3D Earth Globe**: Drag to freely spin the planet, tap glowing city pins (e.g. Tokyo, London, New York, Paris, Sydney, Dubai, Mumbai) with smooth fly-to animations.
  - **Live Wind Turbine**: 3D spinning windmill model whose blade rotation and particle stream match real-time wind speeds.
  - **3D Temperature Bars**: Next 24 hours of temperatures visualized as 3D rising bars with hover tooltips.
  - **3D Coverflow 7-Day Forecast**: Perspective carousel with coverflow depth and smooth sliding.
  - **Parallax Camera**: Smoothly tracks mouse movement on desktop and device tilt on mobile.

### 2. Premium UI/UX & Glassmorphism
- **Dynamic Color Theme**: Ambient lighting and CSS variables adapt to the weather condition and time of day (dawn, day, sunset, dusk, night).
- **Interactive 3D Tilt Flip Cards**:
  - Front: Primary telemetry metric with status badges and indicators.
  - Back: In-depth meteorological analysis, scientific context, and advisory tips.
  - Metrics: UV Index (3D radial gauge), Air Quality Index (concentric multi-pollutant rings), Solar Trajectory Arc, Lunar Phase, Humidity & Dew Point, Barometric Pressure, Visibility, and Rain Probability.
- **Hourly Weather Chart**: Seamless toggle between 2D smooth natural spline area chart and 3D interactive bars.
- **Outfit & Activity Suggestions**: Real-time advice based on conditions (e.g. "Carry an umbrella", "Wear SPF 30 sunscreen", "Ideal for running").
- **Live Local Clock**: Displays the actual current time in the selected city's timezone.

### 3. Smart Features & Utilities
- **City Search & Autocomplete**: Powered by Open-Meteo Geocoding API with debouncing and instant suggestions.
- **Voice Search**: Web Speech API integration for spoken city queries.
- **Geolocation ("Use My Location")**: Auto-detects coordinates and reverse-geocodes to the nearest city.
- **Favorites & Recents**: Saved across sessions using `localStorage`.
- **Side-by-Side City Comparison**: Compare two world cities side by side with temperature delta analysis.
- **Procedural Sound Engine**: Synthesized realistic weather audio (rain, wind, thunder) using the Web Audio API with zero external audio assets needed. Muted by default.
- **Share / Export Snapshot**: Capture and download high-resolution branded weather cards with `html-to-image`.
- **Cursor Particle Trail**: Golden sparkles for clear skies, blue teardrops for rain, snowflakes for snow, and starlight for night.
- **Offline & Error Resilience**: Automatic fallback to cached telemetry when offline, with retry controls.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Image Export**: [html-to-image](https://github.com/bubkoo/html-to-image)
- **Celebrations**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Styling**: Vanilla CSS (CSS variables, glassmorphism, 3D transforms, responsive design)

---

## 🚀 Setup & Running Locally

1. **Clone & Navigate into the project folder**:
   ```bash
   cd weather
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🌐 APIs Used (Free, No API Keys Required)
- **Weather Forecast**: [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- **Air Quality**: [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
- **City Autocomplete**: [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- **Reverse Geocoding**: BigDataCloud Client Reverse Geocode & OpenStreetMap Nominatim
