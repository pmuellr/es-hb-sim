es-hb-sim - elasticsearch heartbeat simulattor
================================================================================

`es-hb-sim` is an elasticsearch uptime/heartbeat simulator, indexing
documents directly into elasticsearch, allowing the up/down state to be
modified live via keypress.

example
================================================================================

```console
$ es-hb-sim 1 4 es-hb-sim https://elastic:changeme@localhost:9200
...
```


usage
================================================================================

```
es-hb-sim <interval> <instances> <index-name> <elastic-search-url>
```

Every `<interval>` seconds, `<instances>` documents will be written to 
`<index-name>` at the elasticsearch cluster `<elastic-search-url>`, each 
document for a different monitor name.

You can quit the program by pressing `q` or `control-c`.  You can toggle the
up/down state of a particular instance by pressing the number key of it's
instance, eg, `1`, `2`, ... `0` (for 10).

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
        name: 'host-${instance}'
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