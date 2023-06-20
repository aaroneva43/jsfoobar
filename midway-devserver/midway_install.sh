#!/usr/bin/env bash
rm -rf  midway-devserver, webinfra-midway-devserver-* &&
npm pack @webinfra/midway-devserver &&
tar zxvf $(ls | grep webinfra-midway-devserver-) &&
mv package midway-devserver &&

# --w2_profile  The proxy rule set -- now support fwbcloud | gslbcloud | sdwan_overlay
node ./midway-devserver/bin/midway.js --env --w2_profile=fwbcloud