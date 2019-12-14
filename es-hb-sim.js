#!/usr/bin/env node

'use strict'

const meow = require('meow')
const es = require('@elastic/elasticsearch')

const { createKeyboard } = require('./lib/keyboard')

const kbd = createKeyboard()

const cliOptions = meow(getHelp(), {
  flags: {
    help: {
      type: 'boolean',
      alias: 'h',
      default: false
    }
  }
})

if (cliOptions.flags.help || cliOptions.input.length === 0) {
  console.log(getHelp())
  process.exit(1)
}

const [intervalS, indexName, monitorName, clusterURL] = cliOptions.input

if (intervalS == null) logError('intervalSeconds parameter missing')
const interval = parseInt(intervalS, 10)
if (isNaN(interval)) logError(`invalid interval parameter: ${intervalS}`)
if (indexName == null) logError('indexName parameter missing')
if (monitorName == null) logError('monitorName parameter missing')
if (clusterURL == null) logError('clusterURL parameter missing')

let esClient

try {
  esClient = new es.Client({ node: clusterURL })
} catch (err) {
  logError(`error creating ES client: ${err.message}`)
}

let UpStatus = false
let DocsWritten = 0

printRuntimeHelp()

toggleUp()
setInterval(writeDoc, interval * 1000)
setInterval(logDocsWritten, 30 * 1000)

kbd.on(null, printRuntimeHelp)
kbd.on('c-c', () => process.exit())
kbd.on('q', () => process.exit())
kbd.on('u', toggleUp)

function logDocsWritten () {
  console.log(`total docs written: ${DocsWritten}`)
}

async function writeDoc () {
  const doc = generateDoc()

  let response
  try {
    response = await esClient.index({
      index: indexName,
      body: doc
    })
  } catch (err) {
    logError(`error indexing document: ${err.message}`)
  }

  if (response.statusCode !== 201) {
    logError(`unexpected error indexing document: ${JSON.stringify(response)}`)
  }

  DocsWritten++
}

function toggleUp () {
  UpStatus = !UpStatus

  const doc = JSON.parse(JSON.stringify(generateDoc()))
  delete doc.event
  delete doc.agent
  console.log('now writing:', JSON.stringify(doc))
}

function printRuntimeHelp () {
  console.log('help: press "u" to toggle up/down, "q" to exit')
}

function generateDoc () {
  return {
    '@timestamp': new Date().toISOString(),
    event: {
      dataset: 'uptime'
    },
    agent: {
      type: 'heartbeat'
    },
    summary: {
      up: UpStatus ? 1 : 0,
      down: UpStatus ? 0 : 1
    },
    monitor: {
      status: UpStatus ? 'up' : 'down',
      name: monitorName
    }
  }
}

function getHelp () {
  return `
es-hb-sim <intervalSeconds> <indexName> <monitorName> <clusterURL>

Writes ES heartbeat documents on an interval, allowing the up/down state to
be changed with keyboard presses.
  `.trim()
}

function logError (message) {
  console.log(message)
  process.exit(1)
}
