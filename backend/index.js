const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting (BONUS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use(cors());
app.use(express.json());
app.use('/bookmarks', limiter);

// In-memory storage
let bookmarks = [
    {
        id: uuidv4(),
        url: 'https://react.dev',
        title: 'React Documentation',
        description: 'Official React documentation and tutorials',
        tags: ['react', 'javascript', 'frontend'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://nodejs.org',
        title: 'Node.js',
        description: 'JavaScript runtime built on Chrome\'s V8 engine',
        tags: ['nodejs', 'javascript', 'backend'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://tailwindcss.com',
        title: 'Tailwind CSS',
        description: 'A utility-first CSS framework',
        tags: ['css', 'tailwind', 'frontend'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://expressjs.com',
        title: 'Express.js',
        description: 'Fast, unopinionated web framework for Node.js',
        tags: ['express', 'nodejs', 'backend'],
        createdAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        url: 'https://vitejs.dev',
        title: 'Vite',
        description: 'Next generation frontend tooling',
        tags: ['vite', 'build-tool', 'frontend'],
        createdAt: new Date().toISOString()
    }
];

// Validation helper
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Metadata fetching helper (BONUS) - Simplified for serverless
const fetchMetadata = async (url) => {
    try {
        // For serverless, we'll use a simpler approach
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        });
        const html = await response.text();

        // Simple title extraction
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        return title || null;
    } catch (error) {
        return null;
    }
};

// GET /bookmarks - Get all bookmarks or filter by tag
app.get('/bookmarks', (req, res) => {
    try {
        const { tag } = req.query;
        let result = bookmarks;

        if (tag) {
            result = bookmarks.filter(bookmark =>
                bookmark.tags && bookmark.tags.includes(tag.toLowerCase())
            );
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /bookmarks/metadata - Fetch metadata from URL (BONUS)
app.get('/bookmarks/metadata', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url || !isValidUrl(url)) {
            return res.status(400).json({
                success: false,
                error: 'Valid URL is required'
            });
        }

        const title = await fetchMetadata(url);

        res.json({
            success: true,
            data: { title: title || 'Unable to fetch title' }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch metadata'
        });
    }
});

// POST /bookmarks - Create new bookmark
app.post('/bookmarks', (req, res) => {
    try {
        const { url, title, description, tags } = req.body;
        const errors = [];

        // Validation
        if (!url) {
            errors.push('URL is required');
        } else if (!isValidUrl(url)) {
            errors.push('URL must be valid');
        }

        if (!title) {
            errors.push('Title is required');
        } else if (title.length > 200) {
            errors.push('Title must be max 200 characters');
        }

        if (description && description.length > 500) {
            errors.push('Description must be max 500 characters');
        }

        if (tags) {
            if (!Array.isArray(tags)) {
                errors.push('Tags must be an array');
            } else if (tags.length > 5) {
                errors.push('Maximum 5 tags allowed');
            } else {
                const hasUppercase = tags.some(tag => tag !== tag.toLowerCase());
                if (hasUppercase) {
                    errors.push('Tags must be lowercase');
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, error: errors.join(', ') });
        }

        const newBookmark = {
            id: uuidv4(),
            url,
            title,
            description: description || undefined,
            tags: tags || undefined,
            createdAt: new Date().toISOString()
        };

        bookmarks.push(newBookmark);
        res.status(201).json({ success: true, data: newBookmark });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /bookmarks/:id - Update bookmark
app.put('/bookmarks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { url, title, description, tags } = req.body;

        const bookmarkIndex = bookmarks.findIndex(b => b.id === id);

        if (bookmarkIndex === -1) {
            return res.status(404).json({ success: false, error: 'Bookmark not found' });
        }

        const errors = [];

        if (url !== undefined) {
            if (!isValidUrl(url)) {
                errors.push('URL must be valid');
            }
        }

        if (title !== undefined) {
            if (!title) {
                errors.push('Title is required');
            } else if (title.length > 200) {
                errors.push('Title must be max 200 characters');
            }
        }

        if (description !== undefined && description && description.length > 500) {
            errors.push('Description must be max 500 characters');
        }

        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                errors.push('Tags must be an array');
            } else if (tags.length > 5) {
                errors.push('Maximum 5 tags allowed');
            } else {
                const hasUppercase = tags.some(tag => tag !== tag.toLowerCase());
                if (hasUppercase) {
                    errors.push('Tags must be lowercase');
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, error: errors.join(', ') });
        }

        const updatedBookmark = {
            ...bookmarks[bookmarkIndex],
            url: url !== undefined ? url : bookmarks[bookmarkIndex].url,
            title: title !== undefined ? title : bookmarks[bookmarkIndex].title,
            description: description !== undefined ? description : bookmarks[bookmarkIndex].description,
            tags: tags !== undefined ? tags : bookmarks[bookmarkIndex].tags
        };

        bookmarks[bookmarkIndex] = updatedBookmark;
        res.json({ success: true, data: updatedBookmark });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /bookmarks/:id - Delete bookmark
app.delete('/bookmarks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(b => b.id === id);

        if (bookmarkIndex === -1) {
            return res.status(404).json({ success: false, error: 'Bookmark not found' });
        }

        const deletedBookmark = bookmarks[bookmarkIndex];
        bookmarks.splice(bookmarkIndex, 1);

        res.json({ success: true, data: deletedBookmark });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
