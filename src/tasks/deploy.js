import s3 from 's3';
import path from 'path';
import fs from 'fs';
import recursive from 'recursive-readdir';
import debugLib from 'debug';

export default async function(compressedFiles) {
  const debug = debugLib('deploy');

  let awsCredentials = {};

  // To support multi-apps hosting in the same server, an app can define a aws-credentials.json to set
  // custom AWS credentials for static assets deployment purpose.
  // If there is no such file, the build system will use environment variables.
  try {
    awsCredentials = JSON.parse(fs.readFileSync(path.join(process.cwd(), './aws.json')));
  } catch (exception) {
    debug('aws.json file not found. Using environment variables instead.');

    awsCredentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    awsCredentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  const client = s3.createClient({
    maxAsyncS3: 20,
    s3RetryCount: 3,
    s3RetryDelay: 1000,
    multipartUploadThreshold: 20971520,
    multipartUploadSize: 15728640,
    s3Options: {
      accessKeyId: awsCredentials.accessKeyId,
      secretAccessKey: awsCredentials.secretAccessKey,
      region: 'us-west-2'
    }
  });
  const defaultS3Params = {
    Bucket: 'windfury.mapleinside.com'
  };

  recursive(path.join(process.cwd(), './dist'), (err, files) => {
    const params = {
      s3Params: JSON.parse(JSON.stringify(defaultS3Params))
    };

    files.map((file) => {
      const relativeFile = file.replace(`${process.cwd()}/dist/`, '');

      params.localFile = path.join(process.cwd(), './dist', relativeFile);
      params.s3Params.Key = relativeFile;

      if (compressedFiles.indexOf(file) > -1) params.s3Params.ContentEncoding = 'gzip';

      if (file.match(/\.(css|js|eot|ttf|woff|woff2|png|gif|jpg|svg)$/)) {
        params.s3Params.CacheControl = 'no-transform, max-age=31536000, s-maxage=31536000';
        params.s3Params.Expires = new Date(new Date().setYear(new Date().getFullYear() + 1));
      } else if (file.match(/\.(html)$/)) {
        params.s3Params.CacheControl = 'no-transform, max-age=60, s-maxage=60';
        params.s3Params.Expires = new Date(new Date().setMinutes(new Date().getMinutes() + 1));
      }

      client.uploadFile(params);
      params.s3Params = JSON.parse(JSON.stringify(defaultS3Params));

      debug(`${path.basename(file)} uploaded`);

      return file;
    });
  });
}
