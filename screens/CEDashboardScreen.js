import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { RN_SDK_VERSIONS, NATIVE_SDK_VERSIONS, PLATFORM_VERSIONS } from '../utils/sdkVersions';

const NC_RED = '#E11D48';

export default function CEDashboardScreen({ navigation }) {
  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'ce_dashboard' });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>CE Dashboard</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>


        {/* Expo SDK Version */}
        <View style={[styles.card, styles.platformCard, { borderLeftColor: '#000000' }]}>
          <View style={styles.platformRow}>
            <View style={[styles.platformIcon, { backgroundColor: '#00000012' }]}>
              <Text style={styles.platformEmoji}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.platformLabel}>Expo SDK</Text>
              <Text style={styles.platformVersion}>v{PLATFORM_VERSIONS.expo}</Text>
            </View>
            <View style={[styles.platformBadge, { backgroundColor: '#00000010' }]}>
              <Text style={[styles.platformBadgeText, { color: '#374151' }]}>SDK 56</Text>
            </View>
          </View>
        </View>

        {/* React Native Version */}
        <View style={[styles.card, styles.platformCard, { borderLeftColor: '#0A7EA4' }]}>
          <View style={styles.platformRow}>
            <View style={[styles.platformIcon, { backgroundColor: '#0A7EA412' }]}>
              <Text style={styles.platformEmoji}>📱</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.platformLabel, { color: '#0A7EA4' }]}>React Native</Text>
              <Text style={styles.platformVersion}>v{PLATFORM_VERSIONS.reactNative}</Text>
            </View>
            <View style={[styles.platformBadge, { backgroundColor: '#0A7EA412' }]}>
              <Text style={[styles.platformBadgeText, { color: '#0A7EA4' }]}>New Arch</Text>
            </View>
          </View>
        </View>

        {/* React Native SDK Versions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>React Native SDK (JS)</Text>
          <View style={styles.versionGrid}>
            {[
              { label: 'Base SDK',      value: `v${RN_SDK_VERSIONS.base}`,     color: '#3B82F6' },
              { label: 'Push SDK',      value: `v${RN_SDK_VERSIONS.push}`,     color: '#10B981' },
              { label: 'AppInbox SDK',  value: `v${RN_SDK_VERSIONS.appinbox}`, color: '#8B5CF6' },
              { label: 'Nudges SDK',    value: `v${RN_SDK_VERSIONS.nudges}`,   color: '#F59E0B' },
            ].map(s => (
              <View key={s.label} style={[styles.versionChip, { borderColor: s.color }]}>
                <Text style={[styles.versionLabel, { color: s.color }]}>{s.label}</Text>
                <Text style={styles.versionValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Native Android SDK Versions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Native Android SDK</Text>
          <View style={styles.versionGrid}>
            {[
              { label: 'Base SDK',      value: `v${NATIVE_SDK_VERSIONS.base}`,     color: '#3B82F6' },
              { label: 'Push SDK',      value: `v${NATIVE_SDK_VERSIONS.push}`,     color: '#10B981' },
              { label: 'AppInbox SDK',  value: `v${NATIVE_SDK_VERSIONS.appinbox}`, color: '#8B5CF6' },
              { label: 'Nudges (PX)',   value: `v${NATIVE_SDK_VERSIONS.nudges}`,   color: '#F59E0B' },
            ].map(s => (
              <View key={s.label} style={[styles.versionChip, { borderColor: s.color }]}>
                <Text style={[styles.versionLabel, { color: s.color }]}>{s.label}</Text>
                <Text style={styles.versionValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  platformCard: { borderLeftWidth: 4, paddingVertical: 14 },
  platformRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  platformIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  platformEmoji: { fontSize: 22 },
  platformLabel: { fontSize: 12, fontWeight: '700', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 0.5 },
  platformVersion: { fontSize: 20, fontWeight: '900', color: '#1A1A2E', marginTop: 2 },
  platformBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  platformBadgeText: { fontSize: 11, fontWeight: '800' },
  versionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  versionChip: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, width: '47%' },
  versionLabel: { fontSize: 11, fontWeight: '700' },
  versionValue: { fontSize: 14, fontWeight: '900', color: '#1A1A2E', marginTop: 3 },
});
