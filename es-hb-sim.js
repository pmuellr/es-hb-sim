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

const [intervalS, instancesS, indexName, clusterURL] = cliOptions.input

if (intervalS == null) logError('intervalSeconds parameter missing')
const interval = parseInt(intervalS, 10)
if (isNaN(interval)) logError(`invalid interval parameter: ${intervalS}`)

if (instancesS == null) logError('instances parameter missing')
const instances = Math.min(9, parseInt(instancesS, 10))
if (isNaN(instances)) logError(`invalid instances parameter: ${instancesS}`)

if (indexName == null) logError('indexName parameter missing')
if (clusterURL == null) logError('clusterURL parameter missing')

let esClient

try {
  esClient = new es.Client({
    node: clusterURL,
    ssl: {
      rejectUnauthorized: false
    }
  })
} catch (err) {
  logError(`error creating ES client: ${err.message}`)
}

const UpStatus = []
for (let i = 1; i <= instances; i++) {
  UpStatus[i] = true
}

let DocsWritten = 0


setInterval(writeDocs, interval * 1000)
setInterval(logDocsWritten, 30 * 1000)

kbd.on(null, printRuntimeHelp)
kbd.on('c-c', () => process.exit())
kbd.on('q', () => process.exit())
for (let i = 0; i < instances; i++) {
  kbd.on(String.fromCharCode(49 + i), () => toggleUp(i + 1))
}

console.log('sample doc:', JSON.stringify(generateDoc(1), null, 4))
printRuntimeHelp()
printCurrentStatus()

function logDocsWritten () {
  console.log(`total docs written: ${DocsWritten}`)
}

async function writeDocs (i) {
  for (let i = 1; i <= instances; i++) {
    writeDoc(i)
  }
}

async function writeDoc (index) {
  const doc = generateDoc(index)

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

function toggleUp (index) {
  UpStatus[index] = !UpStatus[index]
  printCurrentStatus()
}

function printCurrentStatus () {
  const statusLine = []
  for (let i = 1; i <= instances; i++) {
    const status = UpStatus[i] ? '⬆︎' : '⬇︎'
    statusLine.push(`${hostName(i)} ${status}`)
  }

  console.log(statusLine.join('   '));
}
function printRuntimeHelp () {
  console.log(`help: press "1" ... "${instances}" to toggle up/down, "q" to exit`)
}

function generateDoc (index) {
  const upStatus = UpStatus[index]

  return {
    '@timestamp': new Date().toISOString(),
    event: { 
      dataset: 'uptime'
    },
    agent: {
      type: 'heartbeat'
    },
    summary: {
      up: upStatus ? 1 : 0,
      down: upStatus ? 0 : 1
    },
    monitor: {
      status: upStatus ? 'up' : 'down',
      name: hostName(index)
    }
  }
}

function hostName (index) {
  return `host-${index}`
}

function getHelp () {
  return `
es-hb-sim <intervalSeconds> <instances> <indexName> <clusterURL>

Writes ES heartbeat documents on an interval, allowing the up/down state to
be changed with keyboard presses.

Fields in documents written:
  @timestamp              current time
  event.dataset.keyword   'uptime'
  agent.type,keyword      'heartbeat'
  summary.up              1 | 0
  summary.down            0 | 1
  monitor.status.keyword  'up' | 'down'
  monitor.status.name     'host-<instance>'
`.trim()
}

function logError (message) {
  console.log(message)
  process.exit(1)
}
