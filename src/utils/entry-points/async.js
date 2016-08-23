if (module.hot) module.hot.accept();

const {gtmID, isProduction, forceGTM} = process.env.windfury;

function generateGTMSnippet(w, d, s, l, i) {
  const mutableW = w;

  mutableW[l] = mutableW[l] || [];
  mutableW[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  const f = d.getElementsByTagName(s)[0];
  const j = d.createElement(s);
  const dl = l !== 'dataLayer' ? `&l=${l}` : '';

  j.async = true;
  j.src = `//www.googletagmanager.com/gtm.js?id=${i}${dl}`;
  f.parentNode.insertBefore(j, f);
}

if (gtmID && (isProduction || forceGTM)) generateGTMSnippet(window, document, 'script', 'dataLayer', gtmID);

import 'async-module';
