const childProcess = require('child_process')
const { TestServer } = require('./server.js')

const electron6 = require('electron6')
const electron7 = require('electron7')

const local = new TestServer()

const test = (electronBinary, name) => {
  console.log(`Starting ${name}`)
  const cp = childProcess.spawn(electronBinary, ['./electron.js'])
  cp.stdout.on('data', (data) => console.log(`STDOUT ${name}:`, data.toString().replace(/\n$/, '')))
  cp.stderr.on('data', (data) => console.log(`STDERR ${name}:`, data.toString().replace(/\n$/, '')))
  return new Promise(resolve => cp.once('exit', resolve))
}

const main = async () => {
  await local.start()

  await test(electron6, 'electron6')
  await test(electron7, 'electron7')

  await local.stop()
}

main()
