/**
 * Create the host configuration.
 *
 * @returns {String}
 */
export default function() {
  let host = null;

  if (process.env.DOCKER_HOST) {
    host = process.env.DOCKER_HOST.match(new RegExp(/^tcp:\/\/(.*)$/))[1].split(':');
    host = host[0];
  } else {
    host = 'localhost';
  }

  return host;
}
