import { join } from 'path';
import { args2obj, bash, mypath } from './utils.js';
const args = args2obj(process.argv);

/* change following variables as needed  */
const nodeVersion = args.node || '16.0.0';
const nvmInstall = 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh';

console.log('args: ', args);

if (args.env) {
  await env();
}
if (args.dev || args.start || args.dist) {
  const dir = join('../', await mypath(import.meta.url));
  await bash(`. ~/.nvm/nvm.sh && nvm install ${nodeVersion} && cd ${dir} && node index.js ${args.dist ? 'dist' : ''}`);
}

async function env() {
  try {
    if (String(await bash(`ls  ~/.nvm/nvm.sh`)).includes('cannot access')) {
      console.log(`Installing NVM & Node ${nodeVersion}... \n`);
      await bash(`curl -o- ${nvmInstall} | bash`);
    }

    await bash(`. ~/.nvm/nvm.sh && nvm install ${nodeVersion} && cd midway-devserver && npm i`);

    (await import('./initFrp.js')).initfrp();

    const __dirname = await mypath(import.meta.url);

    await bash(
      `cd ${__dirname} && node resetConf.js ${Object.keys(args)
        .filter((key) => typeof args[key] === 'string')
        .map((key) => `--${key}=${args[key]}`)
        .join(' ')}`,
    );
  } catch (e) {
    console.error(e.message);
  }
}
