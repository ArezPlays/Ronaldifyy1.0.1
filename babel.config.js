module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./app"],   // <-- points to app folder
          alias: {
            "@": "./app"      // <-- same as root, so @/ works
          }
        }
      ]
    ]
  };
};
