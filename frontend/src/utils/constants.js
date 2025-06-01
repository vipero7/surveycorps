// Question types for survey builder
export const QUESTION_TYPES = [
    { value: 'text', label: 'Short Text', icon: '📝' },
    { value: 'textarea', label: 'Long Text', icon: '📄' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Phone', icon: '📞' },
    { value: 'number', label: 'Number', icon: '🔢' },
    { value: 'radio', label: 'Single Choice', icon: '⚪' },
    { value: 'checkbox', label: 'Multiple Choice', icon: '☑️' },
    { value: 'dropdown', label: 'Dropdown', icon: '📋' },
    { value: 'rating', label: 'Rating Scale', icon: '⭐' },
    { value: 'date', label: 'Date', icon: '📅' }
];

// Survey status options
export const SURVEY_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CLOSED: 'closed'
};