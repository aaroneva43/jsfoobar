import { exec } from 'child_process';

const isNumeric = (n) => +n === +n && !isNaN(parseFloat(n)); // 'number' or number

const args2obj = (argv) => {
  return argv
    .slice()
    .splice(2)
    .reduce((acc, itm) => {
      const prop = itm.indexOf('=') > 0 ? itm.split('=')[0].replace('--', '') : itm.replace(/^-+/, '');
      const val = itm.indexOf('=') > 0 ? itm.split('=')[1] : 'true';

      return Object.assign(acc, {
        [prop]: isNumeric(val) || ['true', 'false'].includes(val) ? eval(val) : val,
      });
    }, {});
};

function bash(command) {
  return new Promise(function (resolve, reject) {
    exec(command, (error, stdout, stderr) => {
      if (stderr) {
        console.log(stderr);
        // return;
      }
      if (error) console.log(error.message);
      resolve(stdout.trim() || error || stderr);
    });
  });
}

const mypath = async (url) => {
  return (await import('path')).dirname((await import('url')).fileURLToPath(url));
};

export { args2obj, bash, mypath };
