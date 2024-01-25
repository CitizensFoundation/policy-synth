// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

import copy from 'rollup-plugin-copy';
import proxy from 'koa-proxies';
/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');
import { fromRollup } from '@web/dev-server-rollup';
import rollupCommonsJs from "@rollup/plugin-commonjs";

const commonJs = fromRollup(rollupCommonsJs);
import resolve from "@rollup/plugin-node-resolve";
const nodeResolve = fromRollup(resolve);

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: '/',
  watch: false,
  /** Resolve bare module imports */
  nodeResolve: false,
  mimeTypes: {
    '**/*.cjs': 'js',
  },
  port: 2965,
  plugins: [

    nodeResolve({
      preferBuiltins: true,
      browser: true
    }),

  ],
  middleware: [
    proxy('/api/', {
      target: 'http://localhost:5021/',
      //changeOrigin: true
    })
  ],
});
