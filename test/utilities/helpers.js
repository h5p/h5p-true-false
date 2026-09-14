// The h5p server is proxied onto the test runner's origin by web-test-runner.config.js.
const contentTypeName = 'h5p-true-false';

export function buildUrl(contentName) {
	return `/view/${contentTypeName}/${contentName}`;
};