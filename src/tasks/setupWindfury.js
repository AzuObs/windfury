import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Setup Babel configuration.
 *
 * @returns {Promise}
 */
export default async function setupWindfury() {
  return await new Promise(resolve => {
    const windfuryConfig = {
      autoprefixer: {
        browsers: [
          'Android 2.3',
          'Android >= 4',
          'Chrome >= 35',
          'Firefox >= 31',
          'Explorer >= 9',
          'iOS >= 7',
          'Opera >= 12',
          'Safari >= 7.1'
        ]
      },
      gtm: {
        id: 'UA-XXX-YYYY',
        force: false
      },
      cdn: {
        endpoint: '//static.windfury.com/'
      },
      docker: {
        image: 'windfury/my-windfury-app'
      },
      aws: {
        region: 'us-west-2',
        s3: {
          static: {
            bucket: 'static.windfury.com'
          }
        },
        eb: {
          bucket: 'elasticbeanstalk-123456789'
        }
      },
      env: {
        secret: [
          'NPM_TOKEN'
        ]
      }
    };

    fs.writeFileSync(path.join(process.cwd(), './windfury.yml'), yaml.safeDump(windfuryConfig));

    resolve();
  });
}
