import fs from 'fs-extra';
import path from 'path';
import mkdirp from 'mkdirp';
import cp from 'child_process';

import log from '../helpers/log';
import setupNewRelic from '../helpers/setupNewRelic';

const versionName = `${process.env.CIRCLE_BRANCH}-${process.env.CIRCLE_SHA1}`;

/**
 * Write Docker for AWS configuration based on specified configuration
 * and environment variables.
 *
 * @param {String|null} inputEnvFile
 * @param {String|null} AWSEBBucket
 * @param {String|null} dockerImage
 * @param {Number} appPort
 * @param {Array} encryptedEnv
 * @returns {Promise}
 */
function writeDockerAWSConfig({
  inputEnvFile = null,
  AWSEBBucket = null,
  dockerImage = null,
  appPort = 3000,
  encryptedEnv = []
} = {
  inputEnvFile: null,
  AWSEBBucket: null,
  dockerImage: null,
  appPort: 3000,
  encryptedEnv: []
}) {
  return new Promise(resolve => {
    const envFile = fs.readFileSync(path.join(process.cwd(), inputEnvFile), 'utf8');
    const env = {};
    const dockerForAws = {
      AWSEBDockerrunVersion: 2,
      authentication: {
        key: 'dockercfg',
        bucket: AWSEBBucket
      },
      containerDefinitions: [
        {
          name: 'elastic-beanstalk',
          essential: true,
          memory: 496,
          image: `${dockerImage}:${versionName}`,
          portMappings: [
            {
              hostPort: 80,
              containerPort: appPort
            }
          ],
          mountPoints: [],
          environment: []
        }
      ]
    };

    envFile.split('\n').map(item => {
      const tmpEnv = item.split('=');

      if (item !== '') env[tmpEnv[0]] = tmpEnv[1];

      return env;
    });
    encryptedEnv.map(encryptedEnvItem => {
      env[encryptedEnvItem] = process.env[encryptedEnvItem];

      return encryptedEnvItem;
    });

    for (const envProperty in env) {
      if (env.hasOwnProperty(envProperty)) {
        dockerForAws.containerDefinitions[0].environment.push({
          name: envProperty,
          value: env[envProperty]
        });
      }
    }

    return mkdirp(path.join(process.cwd(), './build/eb'), () => {
      fs.writeFileSync(path.join(process.cwd(), './build/eb/Dockerrun.aws.json'), JSON.stringify(dockerForAws));

      return resolve();
    });
  });
}

/**
 * Write Docker for AWS configuration and Elastic Beanstalk extensions,
 * zip it, deploy it to AWS S3 EB bucket, create a new EB app version, and finally
 * update the corresponding EB app environment.
 *
 * @param {String} envFile
 * @param {String} AWSEBEnv
 * @returns {Promise}
 */
export default function deployToEB({envFile = null, AWSEBEnv = null} = {envFile: null, AWSEBEnv: null}) {
  const {
    AWSEBApp,
    AWSEBBucket,
    dockerImage,
    encryptedEnv,
    AWSRegion,
    appPort,
    newRelicAppName,
    newRelicLicenseKey
  } = require('../utils/Config');
  const hasNewRelic = (newRelicAppName && newRelicLicenseKey);

  if (!AWSEBApp || !AWSEBBucket || !AWSRegion || !dockerImage || !AWSEBEnv || !envFile) {
    throw new Error(
      'Missing mandatory configuration properties. Please specify it to let Felfire '
      + 'to be able to deploy on AWS Elastic Beanstalk.'
    );
  }

  return new Promise(async resolve => {
    if (!hasNewRelic) {
      log.yellow('Environment variable \'NEW_RELIC_APP_NAME\' and/or \'NEW_RELIC_LICENSE_KEY\' not found. ' +
        'Skipping New Relic configuration.').info();
    } else {
      await setupNewRelic();
    }

    await writeDockerAWSConfig({
      inputEnvFile: envFile,
      AWSEBBucket,
      dockerImage,
      appPort,
      encryptedEnv
    });

    const fileName = `${versionName}.zip`;
    const deploymentFileName = `/tmp/${fileName}`;

    let cmd = 'cp -R node_modules/felfire/lib/utils/eb-extensions/* build/eb/.ebextensions/ && ';

    if (hasNewRelic) {
      cmd += `sed -i "s/{{NEW_RELIC_APP_NAME}}/${newRelicAppName}/" build/eb/.ebextensions/newrelic.config && ` +
        `sed -i "s/{{NEW_RELIC_LICENSE_KEY}}/${newRelicLicenseKey}/" build/eb/.ebextensions/newrelic.config && `;
    }

    const exec = cp.execSync(
      `${cmd}cd build/eb && ` +
      `zip -r "${deploymentFileName}" Dockerrun.aws.json .ebextensions && ` +
      'cd ../../ && ' +
      `aws s3 cp "${deploymentFileName}" "s3://${AWSEBBucket}" --region ${AWSRegion} && ` +
      `aws elasticbeanstalk create-application-version --application-name ${AWSEBApp} --version-label ` +
      `${versionName} --source-bundle S3Bucket=${AWSEBBucket},S3Key=${fileName} --region ${AWSRegion} && ` +
      `aws elasticbeanstalk update-environment --environment-name ${AWSEBEnv} --version-label ` +
      `${versionName} --region ${AWSRegion}`
    );

    exec.stdout.on('data', data => log.info(data));
    exec.stderr.on('data', data => log.info(data));
    exec.on('exit', code => {
      log.info(code);

      return resolve();
    });
  });
}
