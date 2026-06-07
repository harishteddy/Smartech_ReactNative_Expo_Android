const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

function withKotlinVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = config.modResults.contents.replace(
        `buildscript {`,
        `buildscript {\n  ext {\n    kotlinVersion = "2.1.20"\n  }`
      );
      config.modResults.contents = config.modResults.contents.replace(
        `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')`,
        `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")`
      );
    }
    return config;
  });
}

function withAndroidFixes(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Add firebase-messaging dependency
    if (!contents.includes('firebase-messaging')) {
      contents = contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation 'com.google.firebase:firebase-messaging:24.1.0'`
      );
    }

    // Enable multidex
    if (!contents.includes('multiDexEnabled')) {
      contents = contents.replace(
        'versionName "1.0.0"',
        'versionName "1.0.0"\n        multiDexEnabled true'
      );
    }

    // Add multidex dependency
    if (!contents.includes('androidx.multidex')) {
      contents = contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    implementation 'androidx.multidex:multidex:2.0.1'`
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withAllAndroidFixes(config) {
  config = withKotlinVersion(config);
  config = withAndroidFixes(config);
  return config;
};
