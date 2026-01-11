const SmeeClient = require('smee-client')

const smee = new SmeeClient({
  source: 'https://smee.io/rarkbgpskIrjvWfx',
  target: 'http://localhost:3000/api/webhook',
  logger: console
})

const events = smee.start()

// Stop the process on Ctrl+C
process.on('SIGINT', () => {
  events.close()
  process.exit()
})