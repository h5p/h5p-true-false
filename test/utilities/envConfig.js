module.exports = {
	envPath: process.env.H5P_ENV_PATH ?? 'C:/h5p-testing-poc',
	serverPort: process.env.H5P_SERVER_PORT ?? '8080',
	serverUrl: process.env.H5P_SERVER_URL ?? `http://localhost:${process.env.H5P_SERVER_PORT ?? '8080'}`,
	contentTypeName: process.env.H5P_CONTENT_TYPE_NAME ?? 'h5p-true-false'
};