import os, { type } from 'os';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { args2obj } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));


let params = args2obj(process.argv);

const defaults = {
  fwbcloud: {
    proj: path.join(__dirname, '../../'),
    proj_dist: path.join(__dirname, '../../', 'build'),
    w2_profile: 'fwbcloud',
    developer: os.hostname(),
    mock_server_addr: null,
  },
  sdwan_overlay: {
    proj: path.join(__dirname, '../../'),
    proj_dist: path.join(__dirname, '../../', 'dist'),
    w2_profile: 'sdwan_overlay',
    developer: os.hostname(),
    dev_server_addr: 'https://127.0.0.1:5173',
    server_ip_addr: 'http://10.96.128.160',
    mock_server_addr: null,
  },
  gslbcloud: {
    proj: path.join(__dirname, '../../', 'dev_build'),
    proj_dist: path.join(__dirname, '../../', 'dist'),
    w2_profile: 'gslbcloud',
    developer: os.hostname(),
    dev_server_addr: 'https://127.0.0.1:6001',
    server_ip_addr: null,
    mock_server_addr: null,
  },
};

const selectedDefault = Object.keys(defaults).find((itm) => params['w2_profile'] === defaults[itm]['w2_profile']) || 'fwbcloud';

if (selectedDefault) {
  params = { ...defaults[selectedDefault], ...params };
}
let txt = await readFile(new URL(`../conf.js`, import.meta.url), {
  encoding: 'utf8',
});

Object.keys(params).forEach((itm) => {
  txt = txt.replace(RegExp(`(\\s+)${itm}:.+\\,`), `$1${itm}: ${typeof params[itm] === 'string' ? `"${params[itm]}"` : params[itm]},`);
});

await writeFile(new URL(`../conf.js`, import.meta.url), txt, 'utf8');
