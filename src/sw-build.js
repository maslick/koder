const workboxBuild = require("workbox-build");
const buildSW = () => {
  return workboxBuild.injectManifest({
    swSrc: "src/sw-custom.js", // custom sw rules
    swDest: "build/sw.js", // sw output file (auto-generated)
    globDirectory: "build",
    globPatterns: ["**/*.{js,css,html,png,svg,wasm,ico,json}"],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
  }).then(({ count, size, warnings }) => {
    warnings.forEach(console.warn);
    console.info(`${count} files will be precached, totaling ${size/(1024 * 1024)} MBs.`);
  });
};
buildSW();