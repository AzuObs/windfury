import log from './log';

function format(time) {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

export default function(fn, options = {}) {
  const task = typeof fn.default === 'undefined' ? fn : fn.default;
  const start = new Date();
  const showOptions = options ? `(${JSON.stringify(options)})` : '';

  log.info(`[${format(start)}] Starting '${task.name}${showOptions}'...`);

  return task(options)
    .then(resolution => {
      const end = new Date();
      const time = end.getTime() - start.getTime();

      log.info(`[${format(end)}] Finished '${task.name}${showOptions}' after ${time} ms.`);

      return resolution;
    });
}
