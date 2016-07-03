import _ from 'lodash';

/**
 * Create the global configuration.
 *
 * @param {Object} customConfig
 * @returns {Object}
 */
export default function(customConfig) {
  let env = ['NODE_ENV'];

  if (!_.hasIn(customConfig, 'aws') || !_.hasIn(customConfig, 'aws.bucket') || !_.hasIn(customConfig, 'aws.region')) {
    throw new Error(`
      Missing mandatory options. Please specify aws.bucket and aws.region 
      in your windfury.yml.
    `);
  }

  if (typeof customConfig.env !== 'undefined') env = env.concat(customConfig.env);

  return {
    asyncEntryPoint: customConfig.async_entry_point ? customConfig.async_entry_point : './src/async.js',
    srcPath: customConfig.src_path ? customConfig.src_path : './src',
    distPath: customConfig.dist_path ? customConfig.dist_path : './dist',
    buildDirName: customConfig.build_dir_name ? customConfig.build_dir_name : 'build',
    aws: {
      bucket: customConfig.aws.bucket,
      region: customConfig.aws.region
    },
    env,
    babelConfigPath: customConfig.babel_config_path ? customConfig.babel_config_path : './.babelrc',
    base64MaximumSize: customConfig.base64_maximum_size ? customConfig.base64_maximum_size : 10000,
    autoprefixer: customConfig.autoprefixer ? customConfig.autoprefixer : 'last 2 version',
    gzipCompressionLevel: customConfig.gzip_compression_level ? customConfig.gzip_compression_level : 9,
    gzipCompressionRatio: customConfig.gzip_compression_ratio ? customConfig.gzip_compression_ratio : 0.8,
    imageOptimizationLevel: customConfig.image_optimization_level ? customConfig.image_optimization_level : 7,
    locales: customConfig.locales ? customConfig.locales : null,
    defaultBucketWithPrefix: customConfig.default_bucket_with_prefix ? customConfig.default_bucket_with_prefix : true
  };
}
