import setupBabel from './setupBabel';
import setupESLint from './setupESLint';

/**
 * Setup app configuration.
 *
 * @returns {Promise}
 */
export default async function setup() {
  await setupBabel();

  return await setupESLint();
}
