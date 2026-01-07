# Component Search Frontend

A mobile-friendly electronic component search website built with React and Bootstrap, inspired by Win-Source's design and based on the component_locator_frontend template.

## 🚀 Features

### Landing Page
- **Hero Section**: Prominent search bar with instant search functionality
- **Product Categories**: 8 featured categories with icons and part counts
- **Product Showcase**: Grid layout displaying parts with pricing and stock information
- **Manufacturers Section**: Quick access to trusted component manufacturers
- **Trust Indicators**: Highlights fast shipping, authenticity, ISO certification, and 24/7 support
- **Call-to-Action**: Quote request section for hard-to-find components

### Part Detail Page
- **Product Gallery**: Component image display with zoom capability
- **Tabbed Interface**: Organized sections for pricing, specifications, documents, and related products
- **Multi-Supplier Comparison**: Real-time pricing from 5+ suppliers with stock levels
- **Dynamic Pricing**: Automatic price calculation based on quantity breaks
- **Specifications Table**: Detailed technical, environmental, and general specifications
- **Document Downloads**: Datasheets, application notes, 3D models, and PCB footprints
- **Related Products**: Smart recommendations based on category
- **Breadcrumb Navigation**: Clear hierarchical navigation

### Search Results Page
- **Advanced Filtering**: 
  - Price range slider
  - Category selection
  - Manufacturer filtering
  - Stock availability status
- **Sorting Options**: By relevance, price (low/high), or stock availability
- **Responsive Grid**: Adaptive layout for desktop and mobile devices
- **Filter Sidebar**: Collapsible filters on mobile devices

## 🛠️ Technical Stack

- **Frontend Framework**: React 18.2
- **UI Framework**: Bootstrap 5.3 with React-Bootstrap
- **Routing**: React Router v6
- **Icons**: Font Awesome 6
- **SEO**: React Helmet Async
- **Styling**: Custom CSS with mobile-first approach

## 📱 Mobile-First Design

The application is fully responsive with specific optimizations for:
- Touch-friendly interface elements
- Collapsible navigation menu
- Adaptive search bar placement
- Optimized card layouts for small screens
- Responsive tables with horizontal scrolling

## 🔍 SEO Best Practices

### Meta Tags
- Dynamic title and description tags
- Open Graph tags for social media sharing
- Twitter Card metadata
- Canonical URLs for duplicate content prevention

### Structured Data (JSON-LD)
- Product schema for component pages
- Organization schema for branding
- BreadcrumbList schema for navigation

### Technical SEO
- Semantic HTML5 structure
- Proper heading hierarchy (h1-h6)
- Alt text for images
- Mobile-friendly viewport configuration
- Fast loading with optimized assets

## 🎨 Design System

### Color Palette
```css
Primary Blue: #6fa5ff
Primary Hover: #5a8fff
Accent Green: #059669
Dark Background: #1F2937
Light Background: #F9FAFB
Border Color: #E5E7EB
```

### Typography
- System font stack for optimal performance
- Responsive font sizing
- Clear hierarchy with consistent spacing

## 📁 Project Structure

```
component_search_frontend/
├── public/
│   ├── index.html          # SEO-optimized HTML template
│   └── manifest.json       # PWA configuration
├── src/
│   ├── components/
│   │   ├── Header.js       # Navigation header with search
│   │   ├── Footer.js       # Site footer with links
│   │   ├── SearchBar.js    # Reusable search component
│   │   ├── LandingPage.js  # Homepage component
│   │   ├── PartDetail.js   # Product detail page
│   │   ├── SearchResults.js # Search results with filters
│   │   └── SEO.js          # SEO meta tag manager
│   ├── data/
│   │   └── mockData.js     # Stub data for development
│   ├── App.js              # Main app component with routing
│   ├── App.css             # Custom application styles
│   ├── index.js            # React entry point
│   └── index.css           # Base styles
└── package.json            # Project dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd component_search_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📊 Sample Data

The application includes mock data for 8 electronic components:
- STM32F103C8T6 (Microcontroller)
- LM358N (Operational Amplifier)
- ESP32-WROOM-32 (WiFi Module)
- 1N4148 (Diode)
- ATMEGA328P-PU (Microcontroller)
- NE555P (Timer IC)
- 74HC595 (Shift Register)
- LM7805 (Voltage Regulator)

Each component includes:
- Multiple supplier pricing
- Stock levels
- Technical specifications
- Related documents
- Lead time information

## 🔄 API Integration

The application is ready for API integration. Replace the mock data in `src/data/mockData.js` with actual API calls:

```javascript
// Example API integration
const fetchPartDetails = async (partNumber) => {
  const response = await fetch(`/api/parts/${partNumber}`);
  return response.json();
};
```

## 📈 Performance Optimizations

- Lazy loading for images
- Code splitting with React.lazy()
- Optimized bundle size
- Minimal CSS framework usage
- Efficient re-rendering with React hooks

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

Please follow the existing code style and ensure all new features are mobile-responsive and SEO-optimized.

## 📧 Support

For questions or issues, please contact the development team.

---

Built with ❤️ using React and Bootstrap