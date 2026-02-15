import { useState } from 'react';

function AddBookmarkForm({ onAdd, fetchMetadata }) {
    const [formData, setFormData] = useState({
        url: '',
        title: '',
        description: '',
        tags: ''
    });
    const [errors, setErrors] = useState({});
    const [fetching, setFetching] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // URL validation
        if (!formData.url.trim()) {
            newErrors.url = 'URL is required';
        } else {
            try {
                new URL(formData.url);
            } catch {
                newErrors.url = 'Please enter a valid URL';
            }
        }

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be max 200 characters';
        }

        // Description validation
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be max 500 characters';
        }

        // Tags validation
        if (formData.tags) {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
            if (tagsArray.length > 5) {
                newErrors.tags = 'Maximum 5 tags allowed';
            }
            const hasUppercase = tagsArray.some(tag => tag !== tag.toLowerCase());
            if (hasUppercase) {
                newErrors.tags = 'Tags must be lowercase';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Auto-fetch title when URL changes (BONUS)
    const handleUrlBlur = async () => {
        if (formData.url && !formData.title && fetchMetadata) {
            try {
                new URL(formData.url); // Validate URL first
                setFetching(true);
                const title = await fetchMetadata(formData.url);
                if (title) {
                    setFormData(prev => ({ ...prev, title }));
                }
            } catch {
                // Invalid URL, do nothing
            } finally {
                setFetching(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const tagsArray = formData.tags
            ? formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t)
            : undefined;

        const bookmarkData = {
            url: formData.url,
            title: formData.title,
            description: formData.description || undefined,
            tags: tagsArray
        };

        const success = await onAdd(bookmarkData);

        if (success) {
            setFormData({ url: '', title: '', description: '', tags: '' });
            setErrors({});
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Add New Bookmark</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            URL <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            onBlur={handleUrlBlur}
                            placeholder="https://example.com"
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title <span className="text-red-500">*</span>
                            {fetching && <span className="text-blue-500 text-xs ml-2">Fetching...</span>}
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="My Bookmark"
                            maxLength={200}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Optional description..."
                        maxLength={500}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tags (comma-separated, lowercase)
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="react, javascript, frontend"
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.tags ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                    />
                    {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                    Add Bookmark
                </button>
            </form>
        </div>
    );
}

export default AddBookmarkForm;
