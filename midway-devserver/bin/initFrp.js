import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { $ } from 'zx';

const __dirname = dirname(fileURLToPath(import.meta.url));

const platform = process.platform;
const cpu = os.cpus()?.[0]?.model?.match(/(Intel|Apple)/)?.[0];

// only linux w Intel / Mac w Intel/Apple supported for now
const sources = {
  'linux|Intel': 'https://github.com/fatedier/frp/releases/download/v0.46.1/frp_0.46.1_linux_amd64.tar.gz',
  'darwin|Intel': 'https://github.com/fatedier/frp/releases/download/v0.46.1/frp_0.46.1_darwin_amd64.tar.gz',
  'darwin|Apple': 'https://github.com/fatedier/frp/releases/download/v0.46.1/frp_0.46.1_darwin_arm64.tar.gz',
};

export function initfrp() {
  $.verbose = false;
  try {
    const source = sources[platform + '|' + cpu];
    const filename = source.split('/').pop();
    const dir = filename.replace('.tar.gz', '');

    $`cd ${__dirname} && curl -O -L ${source} && tar -zxvf ${filename} && cp ${dir}/frpc ./ &&  rm -rf ./frp_* && chmod +x frpc`;
  } catch (error) {
    console.warn('failed to get frp bin');
  }
}
