/**
 * sdkVersions.js
 *
 * All versions are read DIRECTLY from package.json and app.json.
 * Metro bundler supports JSON imports natively — no hardcoding needed.
 * Updating package.json or app.json automatically reflects here.
 */

import pkg    from '../package.json';
import appCfg from '../app.json';

// ── Helpers ────────────────────────────────────────────────────────────────
/** Strip semver range prefix (^, ~, >=, etc.) and return the bare version */
function bare(v = '') {
  return v.replace(/^[\^~>=<]+/, '').trim();
}

// ── React Native / JS SDK versions (from package.json dependencies) ────────
const deps = pkg.dependencies ?? {};

export const RN_SDK_VERSIONS = {
  base:     bare(deps['smartech-base-react-native']),
  push:     bare(deps['smartech-push-react-native']),
  appinbox: bare(deps['smartech-appinbox-react-native']),
  nudges:   bare(deps['smartech-reactnative-nudges']),
};

// ── Platform / framework versions (from package.json) ─────────────────────
export const PLATFORM_VERSIONS = {
  expo:        bare(deps['expo']),
  reactNative: bare(deps['react-native']),
};

// ── App version (from app.json) ────────────────────────────────────────────
export const APP_VERSION = appCfg?.expo?.version ?? '—';

// ── Native Android SDK versions (from app.json plugin config) ─────────────
const plugins  = appCfg?.expo?.plugins ?? [];

function pluginConfig(nameSubstr) {
  const entry = plugins.find(p => Array.isArray(p) && typeof p[0] === 'string' && p[0].includes(nameSubstr));
  return entry ? entry[1] : {};
}

const basePluginAndroid    = pluginConfig('smartech-base-expo-plugin')?.android    ?? {};
const pushPluginAndroid    = pluginConfig('smartech-push-expo-plugin')?.android    ?? {};
const inboxPluginAndroid   = pluginConfig('smartech-appinbox-expo-plugin')?.android ?? {};
const nudgesConfig         = basePluginAndroid?.smartechNudges ?? {};

export const NATIVE_SDK_VERSIONS = {
  base:     basePluginAndroid.SMARTECH_BASE_SDK_VERSION    ?? '—',
  push:     pushPluginAndroid.SMARTECH_PUSH_SDK_VERSION    ?? '—',
  appinbox: inboxPluginAndroid.SMARTECH_APPINBOX_SDK_VERSION ?? '—',
  nudges:   nudgesConfig.SMARTECH_NUDGE_SDK_VERSION         ?? '—',
};
