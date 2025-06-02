export const extractApiData = response => {
  return response.data?.data || response.data;
};
export const extractApiError = error => {
  if (error.response?.data) {
    const errorData = error.response.data;

    // Handle validation errors (errors object)
    if (errorData.errors) {
      // Convert errors object to readable string
      if (typeof errorData.errors === 'object') {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('; ');
        return errorMessages;
      }
      return errorData.errors;
    }

    // Handle general error message
    if (errorData.error) {
      return errorData.error;
    }
  }

  // Fallback to default error message
  return error.message || 'An unexpected error occurred';
};
export const isApiSuccess = response => {
  return response.data?.success === true;
};
