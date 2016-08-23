import fs from 'fs-extra';
import path from 'path';

export default function({envFile = './env/dev.env', stringify = false} = {}) {
  let source = null;

  try {
    source = fs.readFileSync(path.join(process.cwd(), envFile), 'utf8');
  } catch (err) {
    throw new Error(`FILE NOT FOUND ERROR: ${envFile} doesn\'t exists.`);
  }

  const env = {};

  source.split('\n').map(item => {
    const tmpEnv = item.split('=');

    if (item !== '') env[tmpEnv[0]] = stringify ? JSON.stringify(tmpEnv[1]) : tmpEnv[1];

    return env;
  });

  return env;
}
