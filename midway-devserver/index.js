 /* eslint-disable */ 
 import path from 'path';
import express from 'express';
import { $, sleep } from 'zx';
import colors from 'colors';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import ip from 'ip';
import _ from 'lodash';
import compression from 'compression';
import handlePortalAPIs from './portal.js';
import { args2obj, bash } from './bin/utils.js';

import conf from './conf.js';

const args = args2obj(process.argv);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODE = args['mode'] || 'dev';
const PORT = MODE === 'dist' ? 4003 : 4002;
const W2PORT = MODE === 'dist' ? 8897 : 8898;
const SHARE_DEV = args['share_dev'] || false;

const app = express();

app.use(express.json());
app.use(compression())

// serve staic if dev_server_addr is not specified
// if (!conf.dev_server_addr) {
//   app.use(express.static(path.join(__dirname, "../")));
// }
app.use(express.static(conf.proj || path.join(__dirname, '../')));

// serve portal gui
app.get(/.*midway-devserver\/portal\/ui\/.*api\/.+$/, async (req, res) => {
  res.send(
    await handlePortalAPIs(req, res, {
      publish_server_addr: _.get(conf, 'publish.to.publish_server_addr'),
      username: _.get(conf, 'publish.to.username'),
      password: _.get(conf, 'publish.to.password'),
    }),
  );
});

console.log(colors.bgMagenta('> starting dev proxy..\n'));

const rstl = String(await $`cd ${__dirname} && npx w2 start -p ${W2PORT} -S ./whistle/conf/${W2PORT}`);
await setupWhistleProfile(conf.w2_profile);

console.log(colors.bgMagenta('\n> 👆 Please change the proxy settings of your browser to above address 👆'));
console.log(colors.bgMagenta('\n> ✨ Then visit the domain name of your site, you are in dev mode! ✨'));
console.log(
  colors.bgCyan(
    `\n[i] To support HTTPS, you need to manually trust the SSL self-signed certificate (http://127.0.0.1:${W2PORT}/cgi-bin/rootca)\n
    MACOS:  https://tosbourn.com/getting-os-x-to-trust-self-signed-ssl-certificates/ \n
    UBUNTU: https://support.securly.com/hc/en-us/articles/206081828-How-do-I-manually-install-the-Securly-SSL-certificate-in-Chrome-\n
    `,
  ),
);

if (MODE === 'dist' || SHARE_DEV) await setupFrpc();

// stop existing devserver PORT
try {
  $.verbose = false;
  await $`kill $(lsof -t -i:${PORT})`;
  await sleep(1000);
} catch (error) {
  // silient
}
app.listen(PORT, () => {
  if (!conf.dev_server_addr) {
    console.log(colors.bgCyan(`dev server started on ${PORT}`));
  }
});

// functions
async function setupWhistleProfile(name = 'fwbcloud') {
  if (MODE === 'dist' && !name.endsWith('_dist')) {
    name += '_dist';
  }

  try {
    const rules = await readFile(new URL(path.join(__dirname, `./whistle/profiles/${name}`), import.meta.url), {
      encoding: 'utf8',
    });
    let w2tip = await readFile(new URL(path.join(__dirname, `./whistle/w2tip.js`), import.meta.url), {
      encoding: 'utf8',
    });

    if (MODE === 'dist') w2tip += 'w2.innerHTML = "dist mode"';

    const { server_ip_addr, dev_server_addr, mock_server_addr } = Object.keys(conf).reduce((acc, key) => {
      const val = conf[key];
      if (typeof val === 'string' && val.endsWith('/')) {
        return { ...acc, [key]: val.replace(/\/$/, '') };
      }
      return { ...acc, [key]: val };
    }, {});

    const formDataRules = {
      name,
      value: rules
        .replace(/{{dev_server_addr}}/g, dev_server_addr || `http://127.0.0.1:${PORT}`)
        .replace(/\/\^.+{{server_ip_addr}}.*/g, (token) => {
          return server_ip_addr ? token.replace(/{{server_ip_addr}}/g, server_ip_addr) : token.replace(/(.*)/, '#$1');
        })
        .replace(/\/\^.+{{mock_server_addr}}.*/g, (token) => {
          return mock_server_addr ? token.replace(/{{mock_server_addr}}/g, mock_server_addr) : token.replace(/(.*)/, '#$1');
        }),
      selected: true,
      changed: true,
    };
    const formDataValues = {
      name: 'w2tip',
      value: w2tip,
    };

    const defaultFetchCfg = {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
    };

    fetch(
      `http://127.0.0.1:${W2PORT}/cgi-bin/intercept-https-connects`,
      Object.assign(defaultFetchCfg, {
        body: 'interceptHttpsConnects=1',
      }),
    );

    fetch(
      `http://127.0.0.1:${W2PORT}/cgi-bin/rules/select`,
      Object.assign(defaultFetchCfg, {
        body: Object.keys(formDataRules)
          .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(formDataRules[key])}`)
          .join('&'),
      }),
    );

    fetch(
      `http://127.0.0.1:${W2PORT}/cgi-bin/values/add`,
      Object.assign(defaultFetchCfg, {
        body: Object.keys(formDataValues)
          .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(formDataValues[key])}`)
          .join('&'),
      }),
    );

    return true;
  } catch (error) {
    console.error(error);
    return 'SOMETHING_WENT_WRONG';
  }
}

async function setupFrpc() {
  const portPool = [8180, 8198];
  const common = conf.publish?.to || {};

  const { username, password, publish_server_addr, publish_server_port } = common;

  const info = conf.publish?.info || {};
  const portal = {
    remote_port: 8199,
    local_port: PORT,
    local_ip: ip.address(),
    type: 'tcp',
  };

  $.verbose = false;

  try {
    info.branch = _.get(String(await $`cd ${conf.proj || path.join(__dirname, '../')} && git branch`).match(/\*.+/), [0], '').replace(/^\*\s/, '');
  } catch (error) {
    info.branch = 'not_a_git_branch';
  }

  info.local_ip = ip.address();
  info.local_port = W2PORT;

  let usedProxies;

  try {
    usedProxies = await fetch(`http://${publish_server_addr}:6443/api/proxy/tcp`, {
    headers: {
      authorization: `Basic ${btoa(username + ':' + password)}`,
    },
  }).then((r) => r.json());
   } catch (error) {
    console.warn(colors.bgRed(error + '\nFailed to connect to publish server, please check your publish config (conf.js)'));

   }

   if (!usedProxies) return;

  // get a usable remote_port
  const usedPorts = usedProxies?.proxies?.reduce((acc, itm) => {
    const port = _.get(itm, 'conf.remote_port');
    return port ? acc.concat(port) : acc;
  }, []);

  let remotePort = portPool[0];
  while (remotePort < portPool[1] && usedPorts.includes(remotePort)) {
    remotePort += 1;
  }

  info.remote_port = remotePort;
  info.type = 'tcp';

  const { project, developer = '', branch = '' } = info;

  let frpStr = '';
  Object.keys({ common, info, portal }).forEach((key) => {
    if (key === 'common') {
      common.server_addr = common.publish_server_addr;
      common.server_port = common.publish_server_port;
      frpStr += '[common] \n';
      ['server_addr', 'server_port', 'token'].forEach((key) => {
        frpStr += `${key} = ${common[key]}\n`;
      });
      frpStr += '\n';
    } else if (key === 'info') {
      frpStr += `[${project || conf.w2_profile} | ${developer} | ${branch}] \n`;
      ['type', 'local_ip', 'local_port', 'remote_port'].forEach((key) => {
        frpStr += `${key} = ${info[key]}\n`;
      });
      frpStr += '\n';
    } else if (key === 'portal' && conf.run_frp_portal) {
      frpStr += `[portal | ${developer}] \n`;
      ['type', 'local_ip', 'local_port', 'remote_port'].forEach((key) => {
        frpStr += `${key} = ${portal[key]}\n`;
      });
    }
  });

  await writeFile(`${path.join(__dirname, 'bin')}/frpc.ini`, frpStr);

  if (MODE === 'dist' || SHARE_DEV) {
    bash(`cd ${path.join(__dirname, 'bin')} && ./frpc -c frpc.ini`).then(r=>console.log(r));
  }
}
