/**
 * Regex that respects the variable naming convention,
 * no digits at the beginning and any non-special char next. 
 */
export const variableName = /^\D\w+$/gm;


/**
 * Regex that match any string excluding special chars.
 */
export const withoutSpecialChar = /^\w+$/gm;