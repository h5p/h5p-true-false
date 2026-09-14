export const serverUrl = 'http://localhost:8080';
export const contentTypeName = 'h5p-true-false';

export function buildUrl(contentName, contentType = contentTypeName) {
	return `${serverUrl}/view/${contentType}/${contentName}`;
};