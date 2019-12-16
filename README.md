es-hb-sim - elasticsearch heartbeat simulattor
================================================================================

`es-hb-sim` is an elasticsearch uptime/heartbeat simulator, indexing
documents directly into elasticsearch, allowing the up/down state to be
modified live via keypress.

```console
$ es-hb-sim 1 monitor-sample host-A https://elastic:changeme@localhost:9200
help: press "u" to toggle up/down, "q" to exit
now writing: {"@timestamp":"2019-12-15T17:16:44.765Z","summary":{"up":1,"down":0},"monitor":{"status":"up","name":"host-A"}}
total docs written: 29
now writing: {"@timestamp":"2019-12-15T17:17:20.317Z","summary":{"up":0,"down":1},"monitor":{"status":"down","name":"host-A"}}
now writing: {"@timestamp":"2019-12-15T17:17:43.170Z","summary":{"up":1,"down":0},"monitor":{"status":"up","name":"host-A"}}
total docs written: 59
...
```


usage
================================================================================

```
es-hb-sim <interval> <index-name> <monitor-name> <elastic-search-url>
```

Every `<interval>` seconds, a document will be written to `<index-name>` at
the elasticsearch cluster `<elastic-search-url>` using the specified
`<monitor-name>`.

You can quit the program by pressing `q` or `control-c`.  You can toggle the
state of the document written (up/down) by pressing `u`.

Every 30 seconds, the number of documents indexed is logged.

The documents written are pretty minimal - open an issue or PR if you want
more fields.

```js
{
    @timestamp: '2019-12-15T17:16:44.765Z',
    event: {
        dataset: 'uptime'
    },
    agent: {
        type: 'heartbeat'
    },
    summary: {
        up: 1 || 0,
        down: 0 || 1
    },
    monitor: {
        status: 'up' || 'down',
        name: '<monitor-name>'
    }
}
```

install
================================================================================

    npm install -g pmuellr/es-hb-sim


license
================================================================================

This package is licensed under the MIT license.  See the [LICENSE.md][] file
for more information.


contributing
================================================================================

Awesome!  We're happy that you want to contribute.

Please read the [CONTRIBUTING.md][] file for more information.


[LICENSE.md]: LICENSE.md
[CONTRIBUTING.md]: CONTRIBUTING.md
[CHANGELOG.md]: CHANGELOG.md