const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Create a test app (simplified version of main app)
const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for tests
let bookmarks = [];

// Validation helper
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Test routes
app.get('/bookmarks', (req, res) => {
    const { tag } = req.query;
    let result = bookmarks;

    if (tag) {
        result = bookmarks.filter(bookmark =>
            bookmark.tags && bookmark.tags.includes(tag.toLowerCase())
        );
    }

    res.json({ success: true, data: result });
});

app.post('/bookmarks', (req, res) => {
    const { url, title, description, tags } = req.body;
    const errors = [];

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
});

// Unit Tests
describe('Bookmark API Tests', () => {
    beforeEach(() => {
        // Reset bookmarks before each test
        bookmarks = [];
    });

    describe('GET /bookmarks', () => {
        test('should return empty array when no bookmarks', async () => {
            const response = await request(app).get('/bookmarks');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });

        test('should return all bookmarks', async () => {
            // Add test bookmarks
            bookmarks = [
                {
                    id: '1',
                    url: 'https://example.com',
                    title: 'Example',
                    tags: ['test'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    url: 'https://test.com',
                    title: 'Test',
                    tags: ['demo'],
                    createdAt: new Date().toISOString()
                }
            ];

            const response = await request(app).get('/bookmarks');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
        });

        test('should filter bookmarks by tag', async () => {
            bookmarks = [
                {
                    id: '1',
                    url: 'https://example.com',
                    title: 'Example',
                    tags: ['react', 'javascript'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    url: 'https://test.com',
                    title: 'Test',
                    tags: ['nodejs'],
                    createdAt: new Date().toISOString()
                }
            ];

            const response = await request(app).get('/bookmarks?tag=react');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].title).toBe('Example');
        });
    });

    describe('POST /bookmarks', () => {
        test('should create a new bookmark with valid data', async () => {
            const newBookmark = {
                url: 'https://example.com',
                title: 'Example Site',
                description: 'A test bookmark',
                tags: ['test', 'example']
            };

            const response = await request(app)
                .post('/bookmarks')
                .send(newBookmark);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.url).toBe(newBookmark.url);
            expect(response.body.data.title).toBe(newBookmark.title);
            expect(response.body.data).toHaveProperty('createdAt');
        });

        test('should reject bookmark without URL', async () => {
            const response = await request(app)
                .post('/bookmarks')
                .send({ title: 'Test' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('URL is required');
        });

        test('should reject bookmark with invalid URL', async () => {
            const response = await request(app)
                .post('/bookmarks')
                .send({ url: 'not-a-valid-url', title: 'Test' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('URL must be valid');
        });

        test('should reject bookmark without title', async () => {
            const response = await request(app)
                .post('/bookmarks')
                .send({ url: 'https://example.com' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Title is required');
        });

        test('should reject bookmark with title > 200 characters', async () => {
            const longTitle = 'a'.repeat(201);
            const response = await request(app)
                .post('/bookmarks')
                .send({ url: 'https://example.com', title: longTitle });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Title must be max 200 characters');
        });

        test('should reject bookmark with > 5 tags', async () => {
            const response = await request(app)
                .post('/bookmarks')
                .send({
                    url: 'https://example.com',
                    title: 'Test',
                    tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Maximum 5 tags allowed');
        });

        test('should reject bookmark with uppercase tags', async () => {
            const response = await request(app)
                .post('/bookmarks')
                .send({
                    url: 'https://example.com',
                    title: 'Test',
                    tags: ['React', 'JavaScript']
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Tags must be lowercase');
        });

        test('should accept bookmark with only required fields', async () => {
            const response = await request(app)
                .post('/bookmarks')
                .send({
                    url: 'https://example.com',
                    title: 'Minimal Bookmark'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.url).toBe('https://example.com');
            expect(response.body.data.title).toBe('Minimal Bookmark');
        });
    });
});
