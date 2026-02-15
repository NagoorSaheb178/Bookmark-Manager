import { useState, useEffect } from 'react';
import AddBookmarkForm from './components/AddBookmarkForm';
import BookmarkList from './components/BookmarkList';
import EditBookmarkModal from './components/EditBookmarkModal';
import Pagination from './components/Pagination';

const API_URL = '/bookmarks';

function App() {
    const [bookmarks, setBookmarks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('');
    const [error, setError] = useState('');
    const [editingBookmark, setEditingBookmark] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9); // 3x3 grid on desktop
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    // Toggle dark mode
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Fetch bookmarks
    const fetchBookmarks = async (tag = '') => {
        try {
            const url = tag ? `${API_URL}?tag=${tag}` : API_URL;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setBookmarks(data.data);
                setError('');
                setCurrentPage(1); // Reset to first page when data changes
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch bookmarks');
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    // Fetch metadata for URL (BONUS)
    const fetchMetadata = async (url) => {
        try {
            const response = await fetch(`/bookmarks/metadata?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.success && data.data.title) {
                return data.data.title;
            }
            return null;
        } catch (err) {
            return null;
        }
    };

    // Add bookmark
    const handleAddBookmark = async (bookmarkData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookmarkData)
            });

            const data = await response.json();

            if (data.success) {
                setBookmarks([data.data, ...bookmarks]);
                setError('');
                setCurrentPage(1); // Go to first page to see new bookmark
                return true;
            } else {
                setError(data.error);
                return false;
            }
        } catch (err) {
            setError('Failed to add bookmark');
            return false;
        }
    };

    // Update bookmark
    const handleUpdateBookmark = async (id, bookmarkData) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookmarkData)
            });

            const data = await response.json();

            if (data.success) {
                setBookmarks(bookmarks.map(b => b.id === id ? data.data : b));
                setError('');
                setEditingBookmark(null);
                return true;
            } else {
                setError(data.error);
                return false;
            }
        } catch (err) {
            setError('Failed to update bookmark');
            return false;
        }
    };

    // Delete bookmark
    const handleDeleteBookmark = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bookmark?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setBookmarks(bookmarks.filter(b => b.id !== id));
                setError('');

                // Adjust page if current page becomes empty
                const newBookmarks = bookmarks.filter(b => b.id !== id);
                const totalPages = Math.ceil(newBookmarks.length / itemsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(totalPages);
                }
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to delete bookmark');
        }
    };

    // Filter bookmarks by search query
    const filteredBookmarks = bookmarks.filter(bookmark => {
        const matchesSearch = searchQuery === '' ||
            bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookmarks = filteredBookmarks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);

    // Handle tag click
    const handleTagClick = (tag) => {
        setActiveTag(tag);
        fetchBookmarks(tag);
    };

    // Clear tag filter
    const handleClearFilter = () => {
        setActiveTag('');
        fetchBookmarks();
    };

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">📚 Bookmark Manager</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Organize and manage your favorite links</p>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                        title="Toggle dark mode"
                    >
                        {darkMode ? '☀️ Light' : '🌙 Dark'}
                    </button>
                </header>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                        <p className="font-medium text-sm sm:text-base">Error: {error}</p>
                    </div>
                )}

                {/* Add Bookmark Form */}
                <div className="mb-8">
                    <AddBookmarkForm onAdd={handleAddBookmark} fetchMetadata={fetchMetadata} />
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by title or URL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                    </div>

                    {activeTag && (
                        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                                Filtered by: <span className="font-semibold">{activeTag}</span>
                            </span>
                            <button
                                onClick={handleClearFilter}
                                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 font-medium text-xs sm:text-sm"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Results count */}
                {filteredBookmarks.length > 0 && (
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookmarks.length)} of {filteredBookmarks.length} bookmarks
                    </div>
                )}

                {/* Bookmark List */}
                <BookmarkList
                    bookmarks={currentBookmarks}
                    onEdit={setEditingBookmark}
                    onDelete={handleDeleteBookmark}
                    onTagClick={handleTagClick}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}

                {/* Edit Modal */}
                {editingBookmark && (
                    <EditBookmarkModal
                        bookmark={editingBookmark}
                        onUpdate={handleUpdateBookmark}
                        onClose={() => setEditingBookmark(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
