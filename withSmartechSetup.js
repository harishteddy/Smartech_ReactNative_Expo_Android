const { withDangerousMod, withAndroidStyles } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Writes android/local.properties with sdk.dir so the build finds the Android SDK.
const withLocalProperties = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const localPropertiesPath = path.join(
        config.modRequest.projectRoot,
        'android',
        'local.properties'
      );
      const sdkDir =
        process.env.ANDROID_HOME ||
        process.env.ANDROID_SDK_ROOT ||
        `${process.env.HOME}/Library/Android/sdk`;
      fs.writeFileSync(localPropertiesPath, `sdk.dir=${sdkDir}\n`, 'utf-8');
      console.log(`[withSmartechSetup] Wrote android/local.properties → sdk.dir=${sdkDir}`);
      return config;
    },
  ]);
};

// Injects TransparentCompat style required by smartech-push SDK.
// Without this style the build fails with "resource style/TransparentCompat not found".
const withTransparentCompatStyle = (config) => {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;
    const resources = styles.resources;

    if (!resources.style) resources.style = [];

    const already = resources.style.find(
      (s) => s.$ && s.$.name === 'TransparentCompat'
    );
    if (!already) {
      resources.style.push({
        $: { name: 'TransparentCompat', parent: 'Theme.AppCompat.Light.NoActionBar' },
        item: [
          { $: { name: 'android:windowIsTranslucent' }, _: 'true' },
          { $: { name: 'android:windowBackground' }, _: '@android:color/transparent' },
          { $: { name: 'android:windowNoTitle' }, _: 'true' },
          { $: { name: 'android:windowFullscreen' }, _: 'false' },
        ],
      });
      console.log('[withSmartechSetup] Injected TransparentCompat style into styles.xml');
    }

    return config;
  });
};

module.exports = (config) => {
  config = withLocalProperties(config);
  config = withTransparentCompatStyle(config);
  return config;
};
