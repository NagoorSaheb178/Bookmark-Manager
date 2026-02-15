function BookmarkCard({ bookmark, onEdit, onDelete, onTagClick }) {
    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200 flex flex-col">
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                {bookmark.title}
            </h3>

            {/* URL */}
            <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mb-3 break-all hover:underline"
            >
                {bookmark.url}
            </a>

            {/* Description */}
            {bookmark.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                    {truncateDescription(bookmark.description)}
                </p>
            )}

            {/* Tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {bookmark.tags.map((tag, index) => (
                        <button
                            key={index}
                            onClick={() => onTagClick(tag)}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-150"
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => onEdit(bookmark)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-3 rounded-lg transition duration-150 text-sm"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(bookmark.id)}
                    className="flex-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 font-medium py-2 px-3 rounded-lg transition duration-150 text-sm"
                >
                    Delete
                </button>
            </div>

            {/* Created Date */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Added: {new Date(bookmark.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}

export default BookmarkCard;
