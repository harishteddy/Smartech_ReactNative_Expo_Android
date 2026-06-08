import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, Switch, ActivityIndicator, ToastAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartechBaseReact from 'smartech-base-react-native';
import SmartechPushReact from 'smartech-push-react-native';
import { HanselUserRn } from 'smartech-reactnative-nudges';
import { APP_VERSION } from '../utils/sdkVersions';

const NC_RED   = '#E11D48';
const NC_DARK  = '#0F172A';
const NC_MUTED = '#94A3B8';
const BG       = '#F4F6F9';

// ── Toast helper ──────────────────────────────────────────────────────────────
function toast(msg) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('', msg, [{ text: 'OK' }]);
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ text }) {
  return <Text style={S.sectionLabel}>{text}</Text>;
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#F1F5F9', marginLeft: 70 }} />;
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ icon, iconBg, title, subtitle, value, disabled, onValueChange }) {
  return (
    <View style={S.row}>
      <View style={[S.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={19} color="#fff" />
      </View>
      <View style={S.rowContent}>
        <Text style={S.rowTitle}>{title}</Text>
        <Text style={S.rowSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E2E8F0', true: NC_RED + '60' }}
        thumbColor={value ? NC_RED : '#CBD5E1'}
        ios_backgroundColor="#E2E8F0"
      />
    </View>
  );
}

// ── Action row ────────────────────────────────────────────────────────────────
function ActionRow({ icon, iconBg, title, subtitle, onPress, danger, tag, showArrow = false }) {
  return (
    <TouchableOpacity style={S.row} onPress={onPress} activeOpacity={0.65}>
      <View style={[S.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={19} color="#fff" />
      </View>
      <View style={S.rowContent}>
        <Text style={[S.rowTitle, danger && { color: '#EF4444' }]}>{title}</Text>
        <Text style={S.rowSub}>{subtitle}</Text>
      </View>
      {tag ? (
        <View style={[S.tag, { backgroundColor: tag.bg }]}>
          <Text style={[S.tagText, { color: tag.color }]}>{tag.label}</Text>
        </View>
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      ) : null}
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const [loading,          setLoading]          = useState(true);
  const [pushOpt,          setPushOpt]          = useState(true);
  const [inAppOpt,         setInAppOpt]         = useState(true);
  const [trackOpt,         setTrackOpt]         = useState(true);
  const [togglingPush,     setTogglingPush]     = useState(false);
  const [togglingInApp,    setTogglingInApp]    = useState(false);
  const [togglingTracking, setTogglingTracking] = useState(false);

  const loadOptStatus = useCallback(() => {
    setLoading(true);
    let pending = 3;
    const next = { push: true, inApp: true, tracking: true };
    const done = () => {
      if (--pending === 0) {
        setPushOpt(next.push);
        setInAppOpt(next.inApp);
        setTrackOpt(next.tracking);
        setLoading(false);
      }
    };
    SmartechPushReact.hasOptedPushNotification((e, v) => { next.push     = !e && typeof v === 'boolean' ? v : true; done(); });
    SmartechBaseReact.hasOptedInAppMessage((e, v)     => { next.inApp    = !e && typeof v === 'boolean' ? v : true; done(); });
    SmartechBaseReact.hasOptedTracking((e, v)         => { next.tracking = !e && typeof v === 'boolean' ? v : true; done(); });
  }, []);

  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'settings' });
    loadOptStatus();
  }, [loadOptStatus]);

  // Toggles
  const togglePush = (v) => {
    setTogglingPush(true); SmartechPushReact.optPushNotification(v); setPushOpt(v); setTogglingPush(false);
    toast(v ? 'Push notifications opted in' : 'Push notifications opted out');
  };
  const toggleInApp = (v) => {
    setTogglingInApp(true); SmartechBaseReact.optInAppMessage(v); setInAppOpt(v); setTogglingInApp(false);
    toast(v ? 'In-app messages opted in' : 'In-app messages opted out');
  };
  const toggleTracking = (v) => {
    setTogglingTracking(true); SmartechBaseReact.optTracking(v); setTrackOpt(v); setTogglingTracking(false);
    toast(v ? 'Event tracking opted in' : 'Event tracking opted out');
  };

  // Notification permission
  const requestPermission    = () => SmartechPushReact.requestNotificationPermission((e, r) => toast(e ? 'Failed' : `Status: ${JSON.stringify(r)}`));
  const updatePermGranted    = () => { SmartechPushReact.updateNotificationPermission(1); toast('Permission synced as GRANTED'); };
  const updatePermDenied     = () => { SmartechPushReact.updateNotificationPermission(0); toast('Permission synced as DENIED'); };

  // Misc
  const syncEvents  = () => { SmartechBaseReact.trackEvent('manual_sync', { triggered_by: 'user' }); toast('Events sync triggered'); };
  const setLocation = () => { SmartechBaseReact.setUserLocation(21.089721, 79.068722); toast('Location set to Nagpur (21.09°N, 79.07°E)'); };

  // Identity / Logout
  const clearIdentity = () =>
    Alert.alert('Clear Identity', 'Remove linked identity — events will be tracked anonymously.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { SmartechBaseReact.clearUserIdentity(); toast('User identity cleared'); } },
    ]);

  const handleLogout = () =>
    Alert.alert('Logout', 'Log out and clear identity from Smartech CE?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {
        SmartechBaseReact.logoutAndClearUserIdentity(true);
        HanselUserRn.clear();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }},
    ]);

  const statusBarH = StatusBar.currentHeight ?? 0;

  return (
    <View style={S.root}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <View style={[S.hero, { paddingTop: statusBarH + 12 }]}>
        <View style={S.heroRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.heroTitle}>Settings</Text>
            <Text style={S.heroSub}>Preferences · Permissions · Identity</Text>
          </View>
          <TouchableOpacity
            onPress={loadOptStatus}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={S.refreshBtn}
          >
            <Ionicons name="refresh-outline" size={18} color={NC_RED} />
          </TouchableOpacity>
        </View>

        {/* Status pills */}
        <View style={S.pillsRow}>
          <View style={[S.statusPill, { backgroundColor: pushOpt ? '#D1FAE5' : '#FEE2E2' }]}>
            <View style={[S.pillDot, { backgroundColor: pushOpt ? '#10B981' : '#EF4444' }]} />
            <Text style={[S.pillText, { color: pushOpt ? '#065F46' : '#991B1B' }]}>Push {pushOpt ? 'On' : 'Off'}</Text>
          </View>
          <View style={[S.statusPill, { backgroundColor: inAppOpt ? '#D1FAE5' : '#FEE2E2' }]}>
            <View style={[S.pillDot, { backgroundColor: inAppOpt ? '#10B981' : '#EF4444' }]} />
            <Text style={[S.pillText, { color: inAppOpt ? '#065F46' : '#991B1B' }]}>In-App {inAppOpt ? 'On' : 'Off'}</Text>
          </View>
          <View style={[S.statusPill, { backgroundColor: trackOpt ? '#D1FAE5' : '#FEE2E2' }]}>
            <View style={[S.pillDot, { backgroundColor: trackOpt ? '#10B981' : '#EF4444' }]} />
            <Text style={[S.pillText, { color: trackOpt ? '#065F46' : '#991B1B' }]}>Track {trackOpt ? 'On' : 'Off'}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={S.loadingBox}>
          <View style={S.loadingCard}>
            <ActivityIndicator size="large" color={NC_RED} />
            <Text style={S.loadingText}>Loading settings…</Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>

          {/* ── Device Info banner ──────────────────────────────────────── */}
          <TouchableOpacity style={S.deviceBanner} activeOpacity={0.8} onPress={() => navigation.navigate('DeviceInfo')}>
            <View style={S.deviceBannerLeft}>
              <View style={S.deviceBannerIcon}>
                <Ionicons name="hardware-chip-outline" size={22} color="#fff" />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={S.deviceBannerTitle}>Device Info</Text>
                <Text style={S.deviceBannerSub}>GUID · Push Token · Identity · Versions</Text>
              </View>
            </View>
            <View style={S.deviceBannerArrow}>
              <Ionicons name="arrow-forward" size={16} color={NC_RED} />
            </View>
          </TouchableOpacity>

          {/* ── GDPR / Opt-in ────────────────────────────────────────────── */}
          <SectionLabel text="GDPR / OPT-IN" />
          <View style={S.card}>
            <ToggleRow
              icon="notifications-outline" iconBg="#3B82F6"
              title="Push Notifications"   subtitle="Receive push alerts on this device"
              value={pushOpt} disabled={togglingPush} onValueChange={togglePush}
            />
            <Divider />
            <ToggleRow
              icon="chatbox-ellipses-outline" iconBg="#10B981"
              title="In-App Messages"         subtitle="Show banners &amp; pop-ups inside the app"
              value={inAppOpt} disabled={togglingInApp} onValueChange={toggleInApp}
            />
            <Divider />
            <ToggleRow
              icon="analytics-outline" iconBg="#F59E0B"
              title="Event Tracking"    subtitle="Track user behaviour with Smartech CE"
              value={trackOpt} disabled={togglingTracking} onValueChange={toggleTracking}
            />
          </View>

          {/* ── Notification permission ──────────────────────────────────── */}
          <SectionLabel text="NOTIFICATION PERMISSION" />
          <View style={S.card}>
            <ActionRow
              icon="notifications-circle-outline" iconBg="#8B5CF6"
              title="Request Permission"
              subtitle="Show system notification permission dialog"
              onPress={requestPermission} showArrow
            />
            <Divider />
            <ActionRow
              icon="checkmark-circle-outline" iconBg="#10B981"
              title="Sync as Granted"
              subtitle="Tell SDK the permission is currently granted"
              onPress={updatePermGranted}
              tag={{ label: 'GRANTED', bg: '#D1FAE5', color: '#065F46' }}
            />
            <Divider />
            <ActionRow
              icon="close-circle-outline" iconBg="#94A3B8"
              title="Sync as Denied"
              subtitle="Tell SDK the permission is currently denied"
              onPress={updatePermDenied}
              tag={{ label: 'DENIED', bg: '#FEE2E2', color: '#991B1B' }}
            />
          </View>

          {/* ── Miscellaneous ────────────────────────────────────────────── */}
          <SectionLabel text="MISCELLANEOUS" />
          <View style={S.card}>
            <ActionRow
              icon="sync-outline"   iconBg="#0EA5E9"
              title="Sync Events"
              subtitle="Force-flush pending events to server"
              onPress={syncEvents}
              tag={{ label: 'MANUAL', bg: '#E0F2FE', color: '#0369A1' }}
            />
            <Divider />
            <ActionRow
              icon="location-outline" iconBg="#EF4444"
              title="Set Location"
              subtitle="Nagpur — 21.09°N, 79.07°E"
              onPress={setLocation}
              tag={{ label: 'NAGPUR', bg: '#FEE2E2', color: '#991B1B' }}
            />
          </View>

          {/* ── Identity & Session ───────────────────────────────────────── */}
          <SectionLabel text="IDENTITY & SESSION" />
          <View style={S.card}>
            <ActionRow
              icon="person-remove-outline" iconBg="#F59E0B"
              title="Clear User Identity"
              subtitle="Remove linked identity — events go anonymous"
              onPress={clearIdentity}
            />
            <Divider />
            <ActionRow
              icon="log-out-outline" iconBg="#EF4444"
              title="Logout"
              subtitle="Sign out and clear identity from Smartech CE"
              onPress={handleLogout}
              danger
            />
          </View>

          {/* ── App Info ─────────────────────────────────────────────────── */}
          <SectionLabel text="ABOUT" />
          <View style={S.card}>
            <View style={S.aboutRow}>
              <View style={[S.iconBox, { backgroundColor: '#6366F1' }]}>
                <Ionicons name="apps-outline" size={19} color="#fff" />
              </View>
              <View style={S.rowContent}>
                <Text style={S.rowTitle}>Smartech Expo Demo</Text>
                <Text style={S.rowSub}>Powered by Netcore CE · SDK 56</Text>
              </View>
              <View style={S.versionBadge}>
                <Text style={S.versionText}>v{APP_VERSION}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Hero
  hero: {
    backgroundColor: NC_DARK,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  heroRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  heroSub:   { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  refreshBtn:{
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },

  // Status pills
  pillsRow:   { flexDirection: 'row', gap: 8 },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  pillDot:    { width: 7, height: 7, borderRadius: 4 },
  pillText:   { fontSize: 12, fontWeight: '800' },

  // Loading
  loadingBox:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingCard: { alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 20, padding: 32, elevation: 4 },
  loadingText: { fontSize: 14, color: NC_MUTED, fontWeight: '600' },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40 },

  // Section label
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 1.3,
    marginTop: 22, marginBottom: 8, marginLeft: 4,
  },

  // Device banner
  deviceBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6,
    borderWidth: 1.5, borderColor: NC_RED + '25',
  },
  deviceBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deviceBannerIcon: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: NC_DARK,
    justifyContent: 'center', alignItems: 'center',
  },
  deviceBannerTitle:{ fontSize: 14, fontWeight: '800', color: NC_DARK },
  deviceBannerSub:  { fontSize: 11, color: NC_MUTED, marginTop: 2 },
  deviceBannerArrow:{
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: NC_RED + '12',
    justifyContent: 'center', alignItems: 'center',
  },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
  },

  // Row (shared)
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  iconBox:    { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  rowContent: { flex: 1, marginRight: 8 },
  rowTitle:   { fontSize: 14, fontWeight: '700', color: NC_DARK },
  rowSub:     { fontSize: 12, color: NC_MUTED, marginTop: 2, lineHeight: 16 },

  // Tag badge
  tag:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // About row
  aboutRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  versionBadge:{ backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  versionText: { fontSize: 12, fontWeight: '800', color: '#475569' },
});
