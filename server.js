const http = require('http')
const { parse } = require('url')
const {promisify} = require('util')

class TestServer {
  constructor ({ port = 30001 } = {}) {
    this.server = http.createServer(this.router)
    this.port = port
    this.hostname = 'localhost'
    this.server.on('error', function (err) {
      console.log(err.stack)
    })
    this.server.on('connection', function (socket) {
      socket.setTimeout(1500)
    })
  }

  async start () {
    return promisify(cb => this.server.listen(this.port, '127.0.0.1', this.hostname, cb))()
  }

  async stop () {
    return promisify(cb => this.server.close(cb))()
  }

  router (req, res) {
    let p = parse(req.url).pathname

    if (p === '/hello') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('world')
    }

    if (p === '/inspect') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      let body = ''
      req.on('data', c => { body += c })
      req.on('end', () => {
        res.end(JSON.stringify({
          method: req.method,
          url: req.url,
          headers: req.headers,
          body
        }))
      })
    }
  }
}

module.exports = { TestServer }
