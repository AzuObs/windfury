/**
 * Create the global configuration.
 *
 * @param {Object} customConfig
 * @returns {Object}
 */
export default function(customConfig) {
  const env = ['NODE_ENV'];

  if (!customConfig || !customConfig.aws || !customConfig.aws.bucket || !customConfig.aws.region) {
    throw new Error('Missing mandatory options. Please specify aws.bucket and aws.region' +
      ' in your windfury.yml.');
  }

  if (typeof customConfig.env !== 'undefined') env.concat(customConfig.env);

  return {
    asyncEntryPoint: customConfig.asyncEntryPoint ? customConfig.asyncEntryPoint : './src/async.js',
    srcPath: customConfig.srcPath ? customConfig.srcPath : './src',
    distPath: customConfig.distPath ? customConfig.distPath : './dist',
    buildDirName: customConfig.buildDirName ? customConfig.buildDirName : 'build',
    aws: {
      bucket: customConfig.aws.bucket,
      region: customConfig.aws.region
    },
    server: {
      port: customConfig.server && customConfig.server.port ? customConfig.server.port : 3000
    },
    env,
    babelConfigPath: customConfig.babelConfigPath ? customConfig.babelConfigPath : './.babelrc',
    base64MaximumSize: customConfig.base64MaximumSize ? customConfig.base64MaximumSize : 10000,
    autoprefixer: customConfig.autoprefixer ? customConfig.autoprefixer : 'last 2 version',
    gzipCompressionLevel: customConfig.gzipCompressionLevel ? customConfig.gzipCompressionLevel : 7,
    openOnStart: customConfig.gzipCompressionLevel ? customConfig.gzipCompressionLevel : false,
    locales: customConfig.locales ? customConfig.locales : ['en']
  };
}
