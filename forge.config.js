module.exports = {
  packagerConfig: {
    asar: true,
    "icon": "src/assets/umiya_mataji.ico",
    "name": "Patidar Yuva Mandal Raipur",
    ignore: [
      "^\\/src$",
      "^\\/node_modules$",
      "^\\/[.].+",
      // [...]
  ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
