const { PassThrough } = require('stream')
const electron = require('electron')

console.log(`ELECTRON IS RUNNING: ${process.versions.electron}\n`)

const wait = (t = 1000) => new Promise(resolve => setTimeout(resolve, t))

const getStream = (chunks) => {
  const s = new PassThrough()
  wait(0).then(async () => {
    for (const chunk of chunks) {
      s.write(chunk)
      await wait(50)
    }
    s.end()
  })
  return s
}

const doRequest = (path, { method, body, contentLength, chunkedEncoding = false } = {}) => new Promise((resolve) => {
  let done = false
  setTimeout(() => {
    if (done) return
    console.error(`/!\\ Request to ${path} TIMEOUT\n`)
    resolve()
  }, 2000)

  console.log(`Starting request to ${path} (options=${JSON.stringify({ method, body: body && body.pipe ? 'STREAM' : body, contentLength, chunkedEncoding })})`)
  const options = {
    url: `http://localhost:30001${path}`,
    method
  }

  const request = electron.net.request(options)
  request.chunkedEncoding = chunkedEncoding
  request.on('error', (err) => {
    console.log(`Request from ${path} got error ${err}\n`)
    done = true
    resolve()
  })
  request.on('response', (response) => {
    response.on('data', (chunk) => {
      console.log(`Response: ${chunk}\n`)
    })
    response.on('end', () => {
      done = true
      resolve()
    })
    response.on('error', (err) => {
      console.log(`Response from ${path} got error ${err}\n`)
      done = true
      resolve()
    })
  })
  if (contentLength) request.setHeader('content-length', contentLength)

  if (Buffer.isBuffer(body)) request.end(body)
  else if (!body) request.end()
  else if (body.pipe) body.pipe(request)
  else throw new Error('Invalid body')
})

electron.app.on('ready', async () => {
  // do requests

  const msg = Buffer.from('test')
  await doRequest('/hello')
  await doRequest('/inspect')
  await doRequest('/inspect', { method: 'POST' })
  await doRequest('/inspect', { method: 'POST', body: msg })
  await doRequest('/inspect', { method: 'POST', body: msg, contentLength: msg.length })
  await doRequest('/inspect', { method: 'POST', body: msg, chunkedEncoding: true })
  await doRequest('/inspect', { method: 'POST', body: getStream([Buffer.from('chunk1'), Buffer.from('chunk2')]) })
  await doRequest('/inspect', {
    method: 'POST',
    body: getStream([Buffer.from('chunk1'), Buffer.from('chunk2')]),
    contentLength: 12
  })
  await doRequest('/inspect', {
    method: 'POST',
    body: getStream([Buffer.from('chunk1'), Buffer.from('chunk2')]),
    chunkedEncoding: true
  })
  await doRequest('/inspect', {
    method: 'POST',
    body: getStream([Buffer.from('chunk1'), Buffer.from('chunk2')]),
    contentLength: 12,
    chunkedEncoding: true
  })


  process.exit(0)
})
