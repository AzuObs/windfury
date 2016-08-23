import recursive from 'recursive-readdir';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import s3 from 's3';
import _ from 'lodash';

import log from '../helpers/log';

/**
 * Compress HTML, CSS, and JavaScript files with Gzip.
 *
 * @returns {Array|Promise}
 */
async function compress() {
  return new Promise((resolve) => {
    const algorithm = zlib.gzip;
    const assetsDir = path.join(process.cwd(), './build');

    recursive(assetsDir, [
      '*.{css,js,txt,xml,ico}',
      'package.json',
      'webpack-assets.json',
      'index.js',
      'node_modules'
    ], (nonCompressibleErr, nonCompressibleFiles) => {
      recursive(assetsDir, ['!*.{css,js}', 'index.js', 'node_modules'], (compressibleErr, compressibleFiles) => {
        const compressedFiles = [];
        const toCompressFiles = _.clone(compressedFiles);

        let originalSize = 0;

        if (toCompressFiles.length > 0) {
          return compressibleFiles.map(file => {
            const content = fs.readFileSync(file, 'utf-8');

            originalSize = content.length;

            return algorithm(content, {
              level: 9
            }, (algorithmErr, result) => {
              toCompressFiles.splice(toCompressFiles.indexOf(file), 1);

              if (result.length / originalSize > 0.8) {
                fs.writeFileSync(file, result);
                compressedFiles.push(file);

                log.green(path.basename(file)).white(' is now gzipped.').info();
              }

              if (toCompressFiles.length === 0) {
                return resolve({
                  assetsFiles: compressibleFiles.concat(nonCompressibleFiles),
                  compressedFiles
                });
              }

              return result;
            });
          });
        }

        return resolve({
          assetsFiles: compressibleFiles.concat(nonCompressibleFiles),
          compressedFiles
        });
      });
    });
  });
}

/**
 * Run the deployment to AWS S3.
 */
export default function deployStatic() {
  const {AWSAccessKeyId, AWSSecretAccessKey, AWSS3StaticBucket, AWSRegion} = require('../utils/Config');

  if (!AWSAccessKeyId || !AWSSecretAccessKey) {
    throw new Error(
      'Missing \'AWS_ACCESS_KEY_ID\' and/or \'AWS_SECRET_ACCESS_KEY\' environment variables. Please '
      + 'specify it to authorize Felfire to deploy on AWS S3.'
    );
  }

  if (!AWSS3StaticBucket || !AWSRegion) {
    throw new Error('Missing \'aws.s3.static.bucket\' and/or \'aws.region\' properties in \'felfire.yml\'.');
  }

  return new Promise(async resolve => {
    const client = s3.createClient({
      maxAsyncS3: 20,
      s3RetryCount: 3,
      s3RetryDelay: 1000,
      multipartUploadThreshold: 20971520,
      multipartUploadSize: 15728640,
      s3Options: {
        accessKeyId: AWSAccessKeyId,
        secretAccessKey: AWSSecretAccessKey,
        region: AWSRegion
      }
    });
    const defaultS3Params = {
      Bucket: AWSS3StaticBucket
    };
    const compressed = await compress();

    if (compressed.assetsFiles.length > 0) {
      log.white('Deploying to ').blue(AWSS3StaticBucket).white('.').info();
    } else {
      log.yellow('No static assets found. Skipping deployment.').info();
    }

    compressed.assetsFiles.map(file => {
      const params = {
        s3Params: JSON.parse(JSON.stringify(defaultS3Params))
      };

      const relativeFile = file.replace(path.join(process.cwd(), './build/'), '');
      const isFileCompressed = compressed.compressedFiles.indexOf(file) > -1;

      params.localFile = path.join(process.cwd(), './build', relativeFile);
      params.s3Params.Key = relativeFile;

      if (isFileCompressed) params.s3Params.ContentEncoding = 'gzip';

      if (file.match(/\.(css|js|eot|ttf|woff|woff2|png|gif|jpg|svg)$/)) {
        params.s3Params.CacheControl = 'no-transform, max-age=31536000, s-maxage=31536000';
        params.s3Params.Expires = new Date(new Date().setYear(new Date().getFullYear() + 1));
      } else if (file.match(/\.(html)$/)) {
        params.s3Params.CacheControl = 'no-transform, max-age=60, s-maxage=60';
        params.s3Params.Expires = new Date(new Date().setMinutes(new Date().getMinutes() + 1));
      }

      client.uploadFile(params);
      params.s3Params = JSON.parse(JSON.stringify(defaultS3Params));

      if (isFileCompressed) {
        log.green(path.basename(file)).white(' is uploaded (gzipped).').info();
      } else {
        log.green(path.basename(file)).white(' is uploaded.').info();
      }

      return file;
    });

    return resolve();
  });
}