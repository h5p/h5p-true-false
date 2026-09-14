H5P True/False Question
==========
[![Build Status](https://travis-ci.org/h5p/h5p-true-false.svg?branch=master)](https://travis-ci.org/h5p/h5p-true-false)

Test your users with 'True or False' questions

It can be used standalone, or within Question Set, Course Presentation and Interactive Video.

[See it in action on the H5P.org project page](https://h5p.org/true-false-question)

## Local testing environment

Tests run against a content type served by the [H5P CLI](https://github.com/h5p/h5p-cli), which
must already be installed and on your `PATH`. `test/setup-h5p-env.js` prepares that environment and
starts the server.

```bash
npm run setup-h5p-env -- C:/h5p-testing-poc            # set up and start the server
npm run setup-h5p-env -- C:/h5p-testing-poc --port 8081
npm run setup-h5p-env -- C:/h5p-testing-poc --no-server # set up only
```

The environment path argument is optional; it falls back to `envConfig.envPath`.

### What the script does

1. Fails if the environment folder does not exist. If `content`, `libraries`, `temp` or `uploads`
   are missing inside it, runs `h5p core` to scaffold them.
2. Reads `library.json` to work out the installed library folder name
   (`<machineName>-<major>.<minor>`, e.g. `H5P.TrueFalse-1.8`) and looks for it under
   `<envPath>/libraries`.
3. If it is missing, runs `h5p setup <contentTypeName>` (up to 3 attempts, since the CLI clones a
   lot of repos and can hit a transient `ECONNRESET`).
4. Replaces that library folder with a symlink (a junction on Windows) pointing at this repo, so
   the server serves your working copy.
5. Copies every folder in `test/artifacts` into `<envPath>/content`, overwriting existing content
   of the same name.
6. Verifies the link and the copied content, then starts `h5p server` unless `--no-server` was
   passed.

### Configuration

`test/utilities/envConfig.js` holds the defaults, each overridable by an environment variable:

| Setting            | Environment variable      | Default                 |
| ------------------ | ------------------------- | ----------------------- |
| `envPath`          | `H5P_ENV_PATH`            | `C:/h5p-testing-poc`    |
| `serverPort`       | `H5P_SERVER_PORT`         | `8080`                  |
| `serverUrl`        | `H5P_SERVER_URL`          | `http://localhost:8080` |
| `contentTypeName`  | `H5P_CONTENT_TYPE_NAME`   | `h5p-true-false`        |

`test/utilities/helpers.js` uses those values in `buildUrl(contentName)` to build content URLs such
as `http://localhost:8080/content/h5p-true-false/H5P-True-False`.

### Running the tests

With the server running in one terminal, run the suite in another:

```bash
npm run unit-test
```

## License

(The MIT License)

Copyright (c) 2016 Joubel AS

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
