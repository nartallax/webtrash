#!/bin/bash

set -e
cd `dirname "$0"`

node ./ts-bundler2/main.js --config ./devserver_bundler.cfg.json
node ./js/devserver.js.compiled $@
