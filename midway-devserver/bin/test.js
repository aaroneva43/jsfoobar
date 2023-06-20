import { args2obj, bash } from "./utils.js";

const args = args2obj(process.argv); console.log(args);



const nodeVer = args.node || '16.0.0';

try {
  if (String(await bash(`ls  ~/.nvm/nvm.sh`)).includes("cannot access")) {
    console.log(`Installing NVM & Node ${nodeVer}... \n`);
    await bash(`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`)
  }

  await bash(`. ~/.nvm/nvm.sh && nvm install ${nodeVer} && cd midway-devserver && npm i`);

} catch (e) {
  console.error(e.message);
}
