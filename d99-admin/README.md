# Diamond Admin - React + Vite Project

A professional React application built with Vite, Bootstrap 5, and custom CSS variables.

## 🚀 Features

- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 19** - Latest React version
- 🎨 **Bootstrap 5.3.3** - Complete UI framework
- 🎯 **React Bootstrap** - Bootstrap components for React
- 🎨 **Custom CSS Variables** - Comprehensive color system
- 🔤 **Google Fonts** - Manrope, Mona Sans, Montserrat, Roboto Condensed
- 🛣️ **React Router** - Client-side routing
- 📡 **Axios** - HTTP client with interceptors
- 📁 **Professional Structure** - Organized folder architecture

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/     # Reusable React components
├── pages/          # Page components
├── layouts/        # Layout components
├── services/       # API services
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
├── context/        # React Context providers
├── styles/         # CSS files
│   ├── variables.css  # CSS custom properties (colors)
│   ├── fonts.css      # Font imports and settings
│   └── index.css      # Main stylesheet
├── App.jsx         # Main App component
└── main.jsx        # Entry point
```

## 🎨 CSS Variables

All color variables are defined in `src/styles/variables.css`. You can use them in your components:

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-white);
}
```

### Available Color Variables

- **Text Colors**: `--text-white`, `--text-black`, `--text-yellow`, `--text-red`, `--text-green`
- **Status Colors**: `--bg-success`, `--bg-warning`, `--bg-danger`, `--bg-info`
- **Theme Colors**: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`
- **Sports Colors**: `--football`, `--tennis`, `--cricket`, `--boxing`, etc.
- **Back/Lay Colors**: `--back`, `--lay`, `--back-hover`, `--lay-hover`

## 🔤 Fonts

The project includes the following Google Fonts:
- **Manrope** - Used for headings
- **Mona Sans** - Available for use
- **Montserrat** - Secondary font
- **Roboto Condensed** - Primary body font

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENV=development
```

### Vite Configuration

The project uses path aliases. Import using `@/` prefix:

```jsx
import { API_BASE_URL } from '@/utils/constants'
```

## 📚 Dependencies

- `react` ^19.2.0
- `react-dom` ^19.2.0
- `bootstrap` ^5.3.3
- `react-bootstrap` ^2.10.8
- `react-router-dom` ^7.6.3
- `axios` ^1.7.9

## 🎯 Next Steps

1. Set up your API endpoints in `src/services/api.js`
2. Create your components in `src/components/`
3. Define your routes in `src/App.jsx`
4. Customize colors in `src/styles/variables.css`

## 📝 License

Private project
