# Bookmark Manager

A clean, minimal, production-ready bookmark manager web application built for technical screening. Features a Node.js/Express backend with in-memory storage and a React/Vite frontend with Tailwind CSS.

## Features

### Backend
- ✅ RESTful API with Express
- ✅ In-memory storage (array-based)
- ✅ Full CRUD operations
- ✅ Comprehensive validation
- ✅ Proper HTTP status codes
- ✅ Standardized JSON responses
- ✅ Tag-based filtering
- ✅ 5 seed bookmarks on startup

### Frontend
- ✅ Modern React with hooks
- ✅ Tailwind CSS styling
- ✅ Add bookmark with validation
- ✅ Edit bookmark (modal)
- ✅ Delete bookmark with confirmation
- ✅ Real-time search (title/URL)
- ✅ Tag filtering (clickable tags)
- ✅ Error handling and display
- ✅ Responsive design

### Bonus Features ⭐
- ✅ **Dark mode toggle** - Persistent theme switching with localStorage
- ✅ **Automatic metadata fetching** - Auto-fetch page titles from URLs
- ✅ **Rate limiting** - API protection (100 requests per 15 minutes)
- ✅ **Pagination** - 9 bookmarks per page with smart navigation
- ✅ **Unit tests** - 11 comprehensive tests for API endpoints

## Tech Stack

**Backend:**
- Node.js
- Express
- UUID (for ID generation)
- CORS

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Fetch API

**Bonus Dependencies:**
- express-rate-limit (rate limiting)
- cheerio (HTML parsing for metadata)
- node-fetch (HTTP requests)
- jest (unit testing)
- supertest (API testing)

## Project Structure

```
bookmark-manager/
├── backend/
│   ├── package.json
│   └── index.js              # Express server with API endpoints
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Main app component
│       ├── index.css         # Tailwind directives
│       └── components/
│           ├── AddBookmarkForm.jsx
│           ├── BookmarkList.jsx
│           ├── BookmarkCard.jsx
│           └── EditBookmarkModal.jsx
├── package.json              # Root with concurrently scripts
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone or extract the project**

2. **Install root dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

4. **Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

### Running the Application

**Option 1: Run both servers concurrently (recommended)**
```bash
npm run dev
```

**Option 2: Run servers separately**

Terminal 1 (Backend):
```bash
npm run backend
```

Terminal 2 (Frontend):
```bash
npm run frontend
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## Deployment

### Deploy to Vercel

This project is configured for easy deployment to Vercel.

**Quick Deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Or deploy via GitHub:**
1. Push your code to GitHub
2. Import to Vercel from dashboard
3. Vercel auto-detects configuration
4. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Note:** In-memory storage resets on each deployment. For production, consider adding a database.

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Get All Bookmarks
```http
GET /bookmarks
```

**Query Parameters:**
- `tag` (optional) - Filter by tag

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "title": "Example",
      "description": "Optional description",
      "tags": ["tag1", "tag2"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. Create Bookmark
```http
POST /bookmarks
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example",
  "description": "Optional description",
  "tags": ["tag1", "tag2"]
}
```

**Validation Rules:**
- `url`: Required, must be valid URL
- `title`: Required, max 200 characters
- `description`: Optional, max 500 characters
- `tags`: Optional, array, max 5 tags, must be lowercase

**Success Response (201):**
```json
{
  "success": true,
  "data": { /* bookmark object */ }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

#### 3. Update Bookmark
```http
PUT /bookmarks/:id
Content-Type: application/json
```

**Request Body:** Same as POST (all fields optional)

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* updated bookmark */ }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Bookmark not found"
}
```

#### 4. Delete Bookmark
```http
DELETE /bookmarks/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* deleted bookmark */ }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Bookmark not found"
}
```

#### 5. Get Metadata (BONUS)
```http
GET /bookmarks/metadata?url=https://example.com
```

**Query Parameters:**
- `url` (required) - URL to fetch metadata from

**Success Response (200):**
```json
{
  "success": true,
  "data": { "title": "Fetched Page Title" }
}
```

## Usage Guide

### Adding a Bookmark
1. Fill in the URL and Title (required)
2. Optionally add a description and tags (comma-separated, lowercase)
3. Click "Add Bookmark"
4. Validation errors will be displayed if any

### Editing a Bookmark
1. Click "Edit" on any bookmark card
2. Modify the fields in the modal
3. Click "Update Bookmark" or "Cancel"

### Deleting a Bookmark
1. Click "Delete" on any bookmark card
2. Confirm the deletion in the dialog

### Filtering by Tag
1. Click any tag badge on a bookmark card
2. The list will filter to show only bookmarks with that tag
3. Click "Clear" to remove the filter

### Searching
1. Type in the search box at the top
2. Results filter in real-time by title or URL

### Dark Mode (BONUS)
1. Click the "🌙 Dark" / "☀️ Light" button in the header
2. Theme preference is saved in localStorage
3. All components support both light and dark themes

### Auto-fetch Title (BONUS)
1. Paste a URL in the add bookmark form
2. Click outside the URL field (blur event)
3. If title is empty, it will automatically fetch the page title
4. A "Fetching..." indicator shows during the process

### Pagination (BONUS)
1. Bookmarks are displayed 9 per page (3x3 grid on desktop)
2. Use Previous/Next buttons or click page numbers
3. Smart page display shows nearby pages and first/last
4. Pagination resets when adding bookmarks or changing search

### Running Unit Tests (BONUS)
```bash
cd backend
npm test
```

**Test Coverage:**
- 11 test cases for GET and POST endpoints
- All validation rules tested
- Edge cases covered
- 100% passing tests

## Development Notes

- **No external database** - All data is stored in memory
- **Data persistence** - Data is lost on server restart (by design)
- **CORS enabled** - Backend accepts requests from any origin
- **Validation** - Both client-side and server-side validation
- **Error handling** - Comprehensive error messages displayed to users
- **Rate limiting** - 100 requests per 15 minutes per IP (BONUS)
- **Dark mode** - Persistent theme with localStorage (BONUS)
- **Metadata fetching** - Automatic page title extraction (BONUS)
- **Pagination** - 9 items per page with smart navigation (BONUS)
- **Unit tests** - 11 comprehensive API tests (BONUS)

## Development Information

**AI Tools Used:** Google Gemini AI Assistant 

**Time Spent:** ~30 minutes

**Assumptions:**
- In-memory storage acceptable (data lost on restart)
- CORS enabled for all origins
- Rate limit: 100 req/15min
- Pagination: 9 items per page

## Testing Checklist

- [ ] Add bookmark with valid data
- [ ] Add bookmark with invalid URL
- [ ] Add bookmark with title > 200 chars
- [ ] Add bookmark with > 5 tags
- [ ] Add bookmark with uppercase tags
- [ ] Edit existing bookmark
- [ ] Edit non-existent bookmark (should show error)
- [ ] Delete bookmark with confirmation
- [ ] Filter by clicking tag
- [ ] Clear tag filter
- [ ] Search by title
- [ ] Search by URL
- [ ] View all bookmarks

## License

MIT



