import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert, TextInput, ToastAndroid, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import SmartechBaseReact from 'smartech-base-react-native';
import SmartechPushReact from 'smartech-push-react-native';
import SmartechAppInboxReact from 'smartech-appinbox-react-native';

const NC_RED   = '#E11D48';
const NC_DARK  = '#1A1A2E';
const NC_MUTED = '#6C757D';

// ── Toast / alert helper ──────────────────────────────────────────────────────
function toast(msg) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('', msg, [{ text: 'OK' }]);
}

// ── Reusable row components ───────────────────────────────────────────────────
function SectionLabel({ title, icon }) {
  return (
    <View style={sec.row}>
      <Ionicons name={icon} size={13} color={NC_RED} />
      <Text style={sec.text}>{title}</Text>
    </View>
  );
}
const sec = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 8 },
  text: { fontSize: 11, fontWeight: '700', color: NC_MUTED, letterSpacing: 1, marginLeft: 6 },
});

function PermissionBadge({ status }) {
  if (!status || status === 'undetermined') return null;
  const granted = status === 'granted';
  return (
    <View style={[act.badge, { backgroundColor: granted ? '#D1FAE5' : '#FEE2E2' }]}>
      <Ionicons name={granted ? 'checkmark-circle' : 'close-circle'} size={12} color={granted ? '#10B981' : '#EF4444'} style={{ marginRight: 3 }} />
      <Text style={[act.badgeText, { color: granted ? '#10B981' : '#EF4444' }]}>{granted ? 'Granted' : 'Denied'}</Text>
    </View>
  );
}

function ActionRow({ icon, iconColor, title, subtitle, onPress, danger = false, statusBadge }) {
  return (
    <TouchableOpacity style={act.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[act.iconBox, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={act.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[act.title, danger && { color: '#EF4444' }]}>{title}</Text>
          {statusBadge !== undefined && <PermissionBadge status={statusBadge} />}
        </View>
        {!!subtitle && <Text style={act.sub}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
const act = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  iconBox:   { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  content:   { flex: 1 },
  title:     { fontSize: 15, fontWeight: '700', color: NC_DARK },
  sub:       { fontSize: 12, color: NC_MUTED, marginTop: 2, lineHeight: 16 },
  badge:     { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});

function RowDivider() {
  return <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 70 }} />;
}

function ActionButton({ label, color, textColor, bordered, icon, onPress }) {
  return (
    <TouchableOpacity
      style={[btn.btn, { backgroundColor: color }, bordered && btn.bordered]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && <Ionicons name={icon} size={15} color={textColor ?? '#FFFFFF'} style={{ marginRight: 6 }} />}
      <Text style={[btn.text, { color: textColor ?? '#FFFFFF' }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const btn = StyleSheet.create({
  btn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 16, borderRadius: 12, marginBottom: 10 },
  bordered:{ borderWidth: 1.5, borderColor: '#E5E5E5' },
  text:    { fontSize: 15, fontWeight: '600' },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function CEDashboardScreen({ navigation }) {
  const insets     = useSafeAreaInsets();
  const statusBarH = StatusBar.currentHeight ?? 0;

  const [inboxCount,        setInboxCount]        = useState(0);
  const [lat,               setLat]               = useState('21.089721');
  const [lon,               setLon]               = useState('79.068722');
  const [fgPermission,      setFgPermission]      = useState(null);   // 'granted'|'denied'|'undetermined'
  const [bgPermission,      setBgPermission]      = useState(null);
  const [fetchingLocation,  setFetchingLocation]  = useState(false);

  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'ce_dashboard' });
    SmartechAppInboxReact.getAppInboxMessageCount(3, (err, count) => {
      if (!err && typeof count === 'number') setInboxCount(count);
    });
    // Load current permission status on mount
    (async () => {
      const fg = await Location.getForegroundPermissionsAsync();
      setFgPermission(fg.status);
      const bg = await Location.getBackgroundPermissionsAsync();
      setBgPermission(bg.status);
    })();
  }, []);

  // ── Push notification permission ──────────────────────────────────────────
  const requestPushPermission = () => {
    SmartechPushReact.requestNotificationPermission((err, res) => {
      if (err) toast('Permission request failed');
      else toast(`Permission status: ${JSON.stringify(res)}`);
    });
  };

  const syncPermissionGranted = () => {
    SmartechPushReact.updateNotificationPermission(1);
    toast('Notification permission synced as GRANTED');
  };

  const syncPermissionDenied = () => {
    SmartechPushReact.updateNotificationPermission(0);
    toast('Notification permission synced as DENIED');
  };

  // ── Location permissions ──────────────────────────────────────────────────

  const requestForegroundLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setFgPermission(status);
    if (status === 'granted') {
      toast('Foreground location permission granted ✓');
    } else {
      Alert.alert(
        'Permission Denied',
        'Foreground location was denied. Enable it in device Settings to use geo-targeting.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const requestBackgroundLocation = async () => {
    // Background location requires foreground permission first
    if (fgPermission !== 'granted') {
      Alert.alert(
        'Foreground Permission Required',
        'Please grant foreground location permission first before requesting background access.',
        [{ text: 'OK', onPress: requestForegroundLocation }]
      );
      return;
    }
    const { status } = await Location.requestBackgroundPermissionsAsync();
    setBgPermission(status);
    if (status === 'granted') {
      toast('Background location permission granted ✓ — Geo-fence is active');
    } else {
      Alert.alert(
        'Background Permission Denied',
        Platform.OS === 'android'
          ? 'Go to Settings → App → Permissions → Location → Allow all the time.'
          : 'Go to Settings → Privacy → Location Services → App → Always.',
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // ── Get live GPS location and send to Smartech ────────────────────────────
  const fetchAndSetLiveLocation = async () => {
    if (fgPermission !== 'granted') {
      Alert.alert('Permission Required', 'Grant foreground location permission first.');
      return;
    }
    try {
      setFetchingLocation(true);
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = pos.coords;
      setLat(String(latitude.toFixed(6)));
      setLon(String(longitude.toFixed(6)));
      SmartechBaseReact.setUserLocation(latitude, longitude);
      toast(`Live location sent → (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    } catch (e) {
      toast('Failed to get location: ' + e.message);
    } finally {
      setFetchingLocation(false);
    }
  };

  // ── Manual / preset location ──────────────────────────────────────────────
  const setCustomLocation = () => {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      toast('Invalid latitude or longitude');
      return;
    }
    SmartechBaseReact.setUserLocation(parsedLat, parsedLon);
    toast(`Location set to (${parsedLat.toFixed(4)}, ${parsedLon.toFixed(4)})`);
  };

  const setNagpurLocation = () => {
    SmartechBaseReact.setUserLocation(21.089721, 79.068722);
    setLat('21.089721');
    setLon('79.068722');
    toast('Location set to Nagpur (21.09°N, 79.07°E)');
  };

  const setMumbaiLocation = () => {
    SmartechBaseReact.setUserLocation(19.076090, 72.877426);
    setLat('19.076090');
    setLon('72.877426');
    toast('Location set to Mumbai (19.08°N, 72.88°E)');
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: () => {
          SmartechBaseReact.logoutAndClearUserIdentity(true);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" translucent={false} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? statusBarH + 10 : insets.top + 10 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <View>
            <Text style={styles.topTitle}>CE Dashboard</Text>
            <Text style={styles.topSub}>Smartech Customer Engagement SDK</Text>
          </View>
        </View>
        <View style={styles.sdkBadge}>
          <View style={styles.sdkDot} />
          <Text style={styles.sdkBadgeText}>CE</Text>
        </View>
      </View>

      {/* ── Quick Access Grid ───────────────────────────────────────────── */}
      <SectionLabel title="QUICK ACCESS" icon="grid-outline" />
      <View style={styles.quickGrid}>
        {[
          { icon: 'phone-portrait-outline', color: '#6366F1', label: 'Device Info',  sub: 'GUID · SDK versions', screen: 'DeviceInfo'   },
          { icon: 'color-wand-outline',     color: '#10B981', label: 'App PZ',       sub: 'Widgets · Banners',   screen: 'AppPZ'        },
          { icon: 'mail-outline',           color: '#3B82F6', label: 'App Inbox',    sub: `${inboxCount} unread`,screen: 'CustomInbox'  },
          { icon: 'settings-outline',       color: NC_MUTED,  label: 'Settings',     sub: 'GDPR · Opt-in',       screen: 'Settings'     },
        ].map(q => (
          <TouchableOpacity
            key={q.label}
            style={styles.quickCard}
            onPress={() => navigation.navigate(q.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: q.color + '18' }]}>
              <Ionicons name={q.icon} size={22} color={q.color} />
            </View>
            <Text style={styles.quickLabel}>{q.label}</Text>
            <Text style={styles.quickSub}>{q.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Push Notification Permission ────────────────────────────────── */}
      <SectionLabel title="PUSH NOTIFICATION PERMISSION" icon="notifications-outline" />
      <View style={styles.card}>
        <ActionRow
          icon="notifications-circle-outline"
          iconColor="#8B5CF6"
          title="Request Permission"
          subtitle="Show system notification permission dialog via SDK"
          onPress={requestPushPermission}
        />
        <RowDivider />
        <ActionRow
          icon="checkmark-circle-outline"
          iconColor="#10B981"
          title="Sync as Granted"
          subtitle="Tell Smartech SDK the permission is granted"
          onPress={syncPermissionGranted}
        />
        <RowDivider />
        <ActionRow
          icon="close-circle-outline"
          iconColor="#F59E0B"
          title="Sync as Denied"
          subtitle="Tell Smartech SDK the permission is denied"
          onPress={syncPermissionDenied}
        />
      </View>

      {/* ── Location Permissions ────────────────────────────────────────── */}
      <SectionLabel title="LOCATION PERMISSIONS" icon="shield-checkmark-outline" />
      <View style={styles.card}>

        {/* Foreground permission row */}
        <ActionRow
          icon="location-outline"
          iconColor="#3B82F6"
          title="Foreground Location"
          subtitle="Required for geo-targeting while app is open"
          onPress={requestForegroundLocation}
          statusBadge={fgPermission}
        />
        <RowDivider />

        {/* Background permission row */}
        <ActionRow
          icon="navigate-outline"
          iconColor="#10B981"
          title="Background Location"
          subtitle={Platform.OS === 'android'
            ? 'Allow "all the time" for geo-fence triggers'
            : 'Allow "Always" for geo-fence triggers'}
          onPress={requestBackgroundLocation}
          statusBadge={bgPermission}
        />

        {/* Geo-fence info note */}
        <View style={styles.geoNote}>
          <Ionicons name="information-circle-outline" size={14} color="#6366F1" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.geoNoteText}>
            Background location is required for Smartech geo-fence campaigns to trigger notifications when the device enters or exits a defined area.
          </Text>
        </View>
      </View>

      {/* ── Set User Location ───────────────────────────────────────────── */}
      <SectionLabel title="SET USER LOCATION" icon="location-outline" />
      <View style={styles.card}>

        {/* Live GPS button */}
        <TouchableOpacity
          style={[styles.liveLocBtn, fetchingLocation && { opacity: 0.7 }]}
          onPress={fetchAndSetLiveLocation}
          activeOpacity={0.8}
          disabled={fetchingLocation}
        >
          <View style={styles.liveLocLeft}>
            <View style={styles.liveLocIconWrap}>
              <Ionicons name={fetchingLocation ? 'sync-outline' : 'navigate'} size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.liveLocTitle}>{fetchingLocation ? 'Getting location…' : 'Use Live GPS Location'}</Text>
              <Text style={styles.liveLocSub}>Fetch current coordinates via device GPS</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        <RowDivider />

        {/* Lat / Lon inputs */}
        <View style={styles.coordRow}>
          <View style={styles.coordInput}>
            <Text style={styles.coordLabel}>LATITUDE</Text>
            <TextInput
              style={styles.coordField}
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
              placeholder="e.g. 21.089721"
              placeholderTextColor="#D1D5DB"
            />
          </View>
          <View style={styles.coordInput}>
            <Text style={styles.coordLabel}>LONGITUDE</Text>
            <TextInput
              style={styles.coordField}
              value={lon}
              onChangeText={setLon}
              keyboardType="numeric"
              placeholder="e.g. 79.068722"
              placeholderTextColor="#D1D5DB"
            />
          </View>
        </View>

        {/* Set manual location button */}
        <View style={styles.locationBtnWrap}>
          <ActionButton label="Set This Location" color={NC_RED} icon="location" onPress={setCustomLocation} />
        </View>

        <RowDivider />

        {/* Preset cities */}
        <View style={styles.presetRow}>
          <Text style={styles.presetLabel}>PRESET CITIES</Text>
          <View style={styles.presetBtns}>
            <TouchableOpacity style={styles.presetBtn} onPress={setNagpurLocation} activeOpacity={0.8}>
              <Ionicons name="location" size={13} color={NC_RED} style={{ marginRight: 4 }} />
              <Text style={styles.presetBtnText}>Nagpur</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={setMumbaiLocation} activeOpacity={0.8}>
              <Ionicons name="location" size={13} color={NC_RED} style={{ marginRight: 4 }} />
              <Text style={styles.presetBtnText}>Mumbai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── App Inbox ───────────────────────────────────────────────────── */}
      <SectionLabel title="APP INBOX" icon="mail-outline" />
      <View style={styles.card}>
        <View style={styles.inboxRow}>
          <Ionicons name="mail-unread-outline" size={20} color={NC_RED} style={{ marginRight: 10 }} />
          <Text style={styles.inboxLabel}>Unread Messages</Text>
          <View style={styles.inboxBadge}>
            <Text style={styles.inboxBadgeText}>{inboxCount}</Text>
          </View>
        </View>
        <RowDivider />
        <View style={styles.cardPad}>
          <ActionButton label="Open App Inbox" color={NC_RED} icon="mail-open-outline" onPress={() => navigation.navigate('CustomInbox')} />
        </View>
      </View>

      {/* ── User Management ─────────────────────────────────────────────── */}
      <SectionLabel title="USER MANAGEMENT" icon="people-outline" />
      <View style={styles.card}>
        <ActionRow
          icon="create-outline"
          iconColor="#3B82F6"
          title="Update Profile"
          subtitle="Edit user attributes in Smartech CE"
          onPress={() => navigation.navigate('UpdateProfile')}
        />
        <RowDivider />
        <ActionRow
          icon="person-remove-outline"
          iconColor="#F59E0B"
          title="Clear User Identity"
          subtitle="Remove linked identity — events go anonymous"
          onPress={() => Alert.alert('Clear Identity', 'Remove the current user identity from Smartech CE?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => { SmartechBaseReact.clearUserIdentity(); toast('User identity cleared'); } },
          ])}
        />
        <RowDivider />
        <ActionRow
          icon="log-out-outline"
          iconColor="#EF4444"
          title="Logout"
          subtitle="Log out and clear identity from Smartech CE"
          onPress={handleLogout}
          danger
        />
      </View>

    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },

  // Header
  topBar: {
    backgroundColor: NC_RED, paddingBottom: 20, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 4, shadowColor: NC_RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  logoRow:    { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  logoLetter:   { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  topTitle:     { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  topSub:       { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sdkBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  sdkDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A7F3D0', marginRight: 5 },
  sdkBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Quick access
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 10 },
  quickCard:  {
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,
  },
  quickIcon:  { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickLabel: { fontSize: 14, fontWeight: '700', color: NC_DARK },
  quickSub:   { fontSize: 11, color: NC_MUTED, marginTop: 3 },

  // Card
  card: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,
    overflow: 'hidden',
  },
  cardPad: { paddingHorizontal: 14, paddingBottom: 6, paddingTop: 4 },

  // Geo-fence note
  geoNote:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EEF2FF', margin: 14, padding: 12, borderRadius: 10 },
  geoNoteText: { flex: 1, fontSize: 12, color: '#4338CA', lineHeight: 17 },

  // Live GPS button
  liveLocBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: NC_RED, marginHorizontal: 14, marginTop: 14, borderRadius: 12, padding: 14 },
  liveLocLeft:    { flexDirection: 'row', alignItems: 'center', flex: 1 },
  liveLocIconWrap:{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  liveLocTitle:   { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  liveLocSub:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Location inputs
  locationNote:     { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF6FF', margin: 14, padding: 12, borderRadius: 10 },
  locationNoteText: { flex: 1, fontSize: 12, color: '#1D4ED8', lineHeight: 17 },
  coordRow:         { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginBottom: 12 },
  coordInput:       { flex: 1 },
  coordLabel:       { fontSize: 10, fontWeight: '800', color: NC_MUTED, letterSpacing: 0.6, marginBottom: 4 },
  coordField:       {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 14, color: NC_DARK, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  locationBtnWrap: { paddingHorizontal: 14 },
  presetRow:   { paddingHorizontal: 14, paddingVertical: 12 },
  presetLabel: { fontSize: 10, fontWeight: '800', color: NC_MUTED, letterSpacing: 0.6, marginBottom: 8 },
  presetBtns:  { flexDirection: 'row', gap: 10 },
  presetBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: NC_RED + '12', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  presetBtnText: { fontSize: 13, fontWeight: '700', color: NC_RED },

  // Inbox
  inboxRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  inboxLabel:    { flex: 1, fontSize: 15, color: NC_DARK, fontWeight: '500' },
  inboxBadge:    { backgroundColor: NC_RED, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 3, minWidth: 28, alignItems: 'center' },
  inboxBadgeText:{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

});
