const workboxBuild = require("workbox-build");
const buildSW = () => {
  // The build is expected to fail if the
  // sw install rules couldn't be generated.
  // Add a catch block for this to skip
  return workboxBuild.injectManifest({
    swSrc: "src/sw-custom.js", // custom sw rules
    swDest: "build/sw.js", // sw output file (auto-generated)
    globDirectory: "build",
    globPatterns: ["**/*.{js,css,html,png,svg}"],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
  })
      .then(({ count, size, warnings }) => {
        warnings.forEach(console.warn);
        console.info(`${count} files will be precached, 
                  totaling ${size/(1024 * 1024)} MBs.`);
      });
};
buildSW();