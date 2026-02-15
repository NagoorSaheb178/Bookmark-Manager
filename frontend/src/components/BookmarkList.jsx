import BookmarkCard from './BookmarkCard';

function BookmarkList({ bookmarks, onEdit, onDelete, onTagClick }) {
    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No bookmarks found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add your first bookmark above!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(bookmark => (
                <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTagClick={onTagClick}
                />
            ))}
        </div>
    );
}

export default BookmarkList;
