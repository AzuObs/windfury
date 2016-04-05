import s3 from 's3';
import path from 'path';
import recursive from 'recursive-readdir';
import logatim from 'logatim';

/**
 * Run the deployment to AWS S3.
 *
 * @param {String} locale
 * @param {Array} compressedFiles
 * @param {Object} config
 */
export default function(locale, compressedFiles, config) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return logatim.error('Missing AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY environment variables. Please ' +
      'specify this variables to authorize Windfury to deploy on AWS S3.');
  }

  if (!process.env.DEPLOY_TO) {
    return logatim.error('Missing DEPLOY_TO environment variable. Please ' +
      'specify this variable to tell Windfury on which AWS S3 bucket to deploy on AWS S3.');
  }

  let bucketName = locale && config.locales[0] !== locale ?
    `${locale}.${config.aws.bucket}` :
    config.aws.bucket;

  if (process.env.DEPLOY_TO === 'staging') bucketName = `staging.${bucketName}`;

  const client = s3.createClient({
    maxAsyncS3: 20,
    s3RetryCount: 3,
    s3RetryDelay: 1000,
    multipartUploadThreshold: 20971520,
    multipartUploadSize: 15728640,
    s3Options: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: config.aws.region
    }
  });
  const defaultS3Params = {
    Bucket: bucketName
  };
  const distDir = locale ?
    path.join(process.cwd(), config.distPath, `./${locale}`) :
    path.join(process.cwd(), config.distPath);

  logatim.white('Deploying to ').blue(bucketName).white('.').info();

  return recursive(distDir, (err, files) => {
    const params = {
      s3Params: JSON.parse(JSON.stringify(defaultS3Params))
    };

    files.map((file) => {
      const relativeFile = locale ?
        file.replace(path.join(process.cwd(), config.distPath, `${locale}/`), '') :
        file.replace(path.join(process.cwd(), `${config.distPath}/`), '');
      const isFileCompressed = compressedFiles.indexOf(file) > -1;

      params.localFile = locale ?
        path.join(process.cwd(), config.distPath, `./${locale}`, relativeFile) :
        path.join(process.cwd(), config.distPath, relativeFile);
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
        logatim.green(path.basename(file)).white(' is uploaded (gzipped).').info();
      } else {
        logatim.green(path.basename(file)).white(' is uploaded.').info();
      }

      return file;
    });
  });
}
