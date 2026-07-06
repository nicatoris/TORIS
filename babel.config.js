module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Disable preset-expo's auto reanimated plugin; nativewind/babel adds it
      // last (where Reanimated requires it to be), avoiding a duplicate pass.
      ["babel-preset-expo", { jsxImportSource: "nativewind", reanimated: false }],
      "nativewind/babel",
    ],
  };
};
