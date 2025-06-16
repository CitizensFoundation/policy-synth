import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import { importMetaAssets } from "@web/rollup-plugin-import-meta-assets";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";
import pkg from "./package.json" with { type: "json" };

function getCustomVersion(version) {
  const date = new Date();
  const formattedDate = date.toLocaleString("en-US", {
    hour12: false,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return `Built on ${formattedDate}`;
}

export default async () => {
  // Await resolution of module paths
  const presetEnvPath = await import.meta.resolve("@babel/preset-env");
  const templateHtmlMinifierPath = await import.meta.resolve(
    "babel-plugin-template-html-minifier"
  );

  return {
    input: ['index.html'],
    output: {
      entryFileNames: "[hash].js",
      chunkFileNames: "[hash].js",
      assetFileNames: "[hash][extname]",
      format: "es",
      dir: "dist",
    },
//    external: (id) => id.startsWith('/ts-out/'),
    preserveEntrySignatures: false,
    plugins: [
      json(),
      commonjs(),
      html({
        minify: false,
        publicPath: "/",
      }),
      copy({
        targets: [{ src: "locales", dest: "dist/" }],
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      nodePolyfills(),
      terser(),
      importMetaAssets(),
      babel({
        babelHelpers: "bundled",
        presets: [
          [
            presetEnvPath,
            {
              targets: [
                "last 3 Chrome major versions",
                "last 3 Firefox major versions",
                "last 3 Edge major versions",
                "last 3 Safari major versions",
              ],
              modules: false,
              bugfixes: true,
            },
          ],
        ],
        plugins: [
          [
            templateHtmlMinifierPath,
            {
              modules: {
                lit: ["html", { name: "css", encapsulation: "style" }],
              },
              failOnError: false,
              strictCSS: true,
              htmlMinifier: {
                collapseWhitespace: true,
                conservativeCollapse: true,
                removeComments: true,
                caseSensitive: true,
                minifyCSS: true,
              },
            },
          ],
        ],
      }),
      replace({
        preventAssignment: true,
        __VERSION__: getCustomVersion(pkg.version),
      }),
      // Uncomment and configure additional plugins as needed
      // analyze({ summaryOnly: true }),
      // generateSW({...}),
    ],
  };
};
