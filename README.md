# Central Celulares

E-commerce website for a cell phone store in Paraguay. Features a modern, responsive design with dynamic product listings, search functionality, and backend API integration.

## Features

- **Dynamic Product Catalog**: Browse cell phones with filtering by category and condition (new/used)
- **Search Functionality**: Real-time search across all pages with debouncing
- **Responsive Design**: Mobile-first design that works on all devices
- **Theme System**: Multiple color themes available
- **Admin Backend**: Node.js/Express API with Supabase integration
- **Configuration-driven**: Easily customize site behavior through config.json
- **Accessibility**: Keyboard navigation support
- **Performance**: Image lazy loading and API response caching

## Tech Stack

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- No framework dependencies

### Backend
- Node.js with Express
- Supabase (PostgreSQL database)
- CORS-enabled API
- Image processing with Sharp

## Project Structure

```
Central Celulares/
├── assets/
│   ├── css/
│   │   ├── styles.css          # Main stylesheet
│   │   ├── about.css           # About page styles
│   │   ├── product-detail.css  # Product detail styles
│   │   └── themes/             # Color theme variations
│   ├── js/
│   │   ├── api-base.js         # API endpoint configuration
│   │   ├── constants.js        # Shared constants
│   │   ├── utils.js            # Utility functions
│   │   ├── products.js         # Product listing logic
│   │   ├── product-detail.js   # Product detail logic
│   │   ├── navigation.js       # Dynamic navigation
│   │   ├── about.js            # About page logic
│   │   ├── services.js         # Services page logic
│   │   ├── site-config.js      # Site configuration loader
│   │   └── theme.js            # Theme switcher
│   └── images/
│       └── products/           # Product images
├── backend/
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── middleware/         # Auth middleware
│   │   └── routes/             # API routes
│   ├── server.js               # Express server
│   └── package.json
├── index.html                  # Main product listing page
├── product.html                # Product detail page
├── about.html                  # About us page
├── services.html               # Services page
├── config.json                 # Site configuration
├── products.json               # Product data (fallback)
└── socials.json                # Social media links

```

## Setup Instructions

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Central Celulares"
   ```

2. **Configure the site**
   - Edit `config.json` to customize:
     - Pagination settings
     - Theme colors
     - Contact information (WhatsApp, phone, email)
     - Site locale and currency
     - About us content

3. **Update social media links**
   - Edit `socials.json` to add/update social media profiles

4. **Serve the frontend**
   - Use any static file server, for example:
   ```bash
   # Using Python 3
   python -m http.server 5500
   
   # Using Node.js http-server
   npx http-server -p 5500
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5500`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` and add:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Server Configuration
   PORT=3002
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5500
   ```

5. **Setup database**
   - Run the SQL scripts in order:
   ```bash
   # Connect to your Supabase project and run:
   # 1. database-setup.sql (creates tables)
   # 2. link-admin-user.sql (optional - for admin access)
   ```

6. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Verify API is running**
   - Visit `http://localhost:3002/api/health`
   - You should see: `{"status":"ok","message":"Central Celulares API is running"}`

## Configuration

### Site Configuration (config.json)

```json
{
  "site": {
    "name": "Central Celulares",
    "currency": "PYG",
    "locale": "es-PY"
  },
  "contact": {
    "whatsapp": "595XXXXXXXXX",
    "phone": "+595 21 123 4567",
    "email": "info@centralcelulares.com"
  },
  "theme": {
    "current": "cyan"
  },
  "pagination": {
    "itemsPerPage": 8
  }
}
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `GET /api/config` - Get site configuration
- `GET /api/config/navigation` - Get navigation menu
- `GET /api/config/socials_data` - Get social media links

## Development

### Adding New Products

Products can be added through:
1. Backend API (recommended for production)
2. Direct database insert via Supabase dashboard
3. Editing `products.json` (fallback only)

Product schema:
```json
{
  "id": 1,
  "name": "iPhone 15 128GB",
  "price": 7803425,
  "oldPrice": null,
  "image": "assets/images/products/iPhone 15 128GB.png",
  "inStock": true,
  "category": "iPhone",
  "condition": "new",
  "badges": [{"type": "stock", "text": "En Stock"}],
  "specifications": [
    "Pantalla: 6.1 pulgadas Super Retina XDR",
    "Memoria: 128GB de almacenamiento, 6GB de RAM"
  ]
}
```

### Customizing Themes

Edit `config.json` to add new themes:
```json
{
  "theme": {
    "available": [
      {
        "name": "custom",
        "label": "Custom Theme",
        "primary": "#FF5733",
        "secondary": "#33FF57"
      }
    ]
  }
}
```

### Code Style

- Use ES6+ features
- Add JSDoc comments for functions
- Sanitize user inputs
- Use semantic HTML
- Follow existing naming conventions

## Deployment

### Frontend (GitHub Pages / Netlify / Vercel)

1. Update `api-base.js` with production backend URL
2. Build and deploy static files
3. Configure custom domain (optional)

### Backend (Heroku / Railway / Koyeb)

1. Set environment variables in hosting platform
2. Deploy from `backend/` directory
3. Update CORS origins in `server.js`
4. Update `FRONTEND_URL` environment variable

## Troubleshooting

### Products not loading
- Check browser console for errors
- Verify backend is running (`/api/health`)
- Check CORS configuration
- Verify Supabase credentials

### Images not displaying
- Ensure image paths are correct
- Check file extensions match
- Verify images exist in `assets/images/products/`

### Search not working
- Clear browser cache
- Check console for JavaScript errors
- Verify `utils.js` and `constants.js` are loaded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

All rights reserved © Central Celulares

## Support

For issues or questions, contact:
- Email: info@centralcelulares.com
- WhatsApp: +595 XXX XXX XXX
