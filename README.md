# Testcase for bug in electron's `net` module when setting content length

Starting with electron@7, setting a `content-length` header when creating a request makes it fail with `net::ERR_INVALID_ARGUMENT`.

On electron@6, such a request succeeds.

In this repo, we test this by launching a simple HTTP server, and running a simple script that makes such requests,
using multiple versions of electron.

Simply do:
```bash
npm i
npm start
```

When running this, we can see that in electron@6 all requests succeed. On electron@7 however, all requests that set an
explicit content-length fail with said error. This is not a huge problem for normal requests, as the `content-length`
is automatically computed and set by the `net` module. However, for requests that set `chunkedEncoding: true`, the
request is sent in chunks so the `net` module cannot know, so does not send, the `content-length`.

This problem, in addition to being an undocumented breaking change, makes it impossible to explicitly set the
`content-length` in the case of a chunked request, when the application can know the content length by other means
(for example when it is a file being uploaded).
