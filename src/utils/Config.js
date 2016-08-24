import path from 'path';
import _ from 'lodash';
import yaml from 'js-yaml';
import fs from 'fs-extra';

let config = null;

try {
  config = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), './windfury.yml')));
} catch (err) {
  throw new Error('FILE NOT FOUND ERROR: \'windfury.yml\' missing. Please specify a Windfury\'s configuration. ' +
    'See more information: https://github.com/mapleinside/windfury.');
}

export const isProduction = process.env.NODE_ENV === 'production';
export const AWSAccessKeyId = process.env.AWS_ACCESS_KEY_ID || null;
export const AWSSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || null;
export const appPort = parseInt(process.env.APP_PORT, 10) || 3000;

export const AWSRegion = _.hasIn(config, 'aws.region') ? config.aws.region : null;
export const AWSS3Bucket = _.hasIn(config, 'aws.s3.bucket') ? config.aws.s3.bucket : null;
export const encryptedEnv = _.hasIn(config, 'env.secret') ? config.env.secret : [];
export const autoprefixerBrowsers = _.hasIn(config, 'autoprefixer.browsers') ? config.autoprefixer.browsers : [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1'
];
export const cdnEndpoint = _.hasIn(config, 'cdn.endpoint') ? config.cdn.endpoint : '/';
export const gtmID = _.hasIn(config, 'gtm.id') ? config.gtm.id : null;
export const forceGTM = _.hasIn(config, 'gtm.force') ? config.gtm.force : false;
