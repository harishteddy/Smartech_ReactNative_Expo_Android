import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Linking, Platform, StatusBar, Image, FlatList, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartechBaseReact from 'smartech-base-react-native';
import { HanselRn, HanselTrackerRn } from 'smartech-reactnative-nudges';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NC_RED  = '#E11D48';
const NC_DARK = '#1A1A2E';
const NC_MUTED = '#6C757D';

const DEMO_BANNERS = [
  {
    title: 'Hansel Nudges',
    message: 'Deliver in-app nudges without an app release',
    mediaUrl: '',
    backgroundColor: NC_RED,
    ctaLabel: 'Active',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: NC_RED,
  },
  {
    title: 'Deeplink Routing',
    message: 'Route users to the right screen from any nudge CTA',
    mediaUrl: '',
    backgroundColor: '#7C3AED',
    ctaLabel: 'Configured',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: '#7C3AED',
  },
  {
    title: 'Event Forwarding',
    message: 'Every Hansel event forwarded to Smartech CE analytics',
    mediaUrl: '',
    backgroundColor: '#0EA5E9',
    ctaLabel: 'Listening',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: '#0EA5E9',
  },
];

export default function PXDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const carouselRef = useRef(null);
  const autoScrollTimer = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [eventListenerActive, setEventListenerActive] = useState(false);
  const [deeplinkListenerActive, setDeeplinkListenerActive] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [lastDeeplink, setLastDeeplink] = useState('');

  // ── Auto-scroll ─────────────────────────────────────────────────────────────

  const startAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % DEMO_BANNERS.length;
        carouselRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => { if (autoScrollTimer.current) clearInterval(autoScrollTimer.current); };
  }, [startAutoScroll]);

  // ── Screen tracking ──────────────────────────────────────────────────────────

  useEffect(() => {
    HanselRn.onSetScreen('PXDashboard');
    SmartechBaseReact.trackEvent('screen_load', { screen: 'px_dashboard' });
    return () => HanselRn.onUnsetScreen();
  }, []);

  // ── Hansel Event Listener ────────────────────────────────────────────────────

  const registerEventListener = () => {
    HanselTrackerRn.registerHanselTrackerListener();
    HanselTrackerRn.addListener('HanselTrackerEvent', (data) => {
      const name = data?.eventName ?? 'hansel_event';
      const props = data?.properties ?? {};
      setLastEvent({
        name,
        time: new Date().toLocaleTimeString(),
        payload: Object.keys(props).length > 0 ? JSON.stringify(props) : undefined,
      });
      console.log('HanselTrackerEvent ::', name, props);
    });
    setEventListenerActive(true);
  };

  const deregisterEventListener = () => {
    HanselTrackerRn.deRegisterListener();
    HanselTrackerRn.removeListener('HanselTrackerEvent');
    setEventListenerActive(false);
  };

  // ── Hansel Deeplink Listener ─────────────────────────────────────────────────

  const registerDeeplinkListener = () => {
    HanselTrackerRn.registerHanselDeeplinkListener();
    HanselTrackerRn.addListener('HanselDeeplinkEvent', (data) => {
      const url = data?.url ?? '';
      setLastDeeplink(url || 'No URL received');
      console.log('HanselDeeplinkEvent ::', url);
      if (url) Linking.openURL(url).catch(() => Alert.alert('Nudge Deeplink', url));
    });
    setDeeplinkListenerActive(true);
  };

  const deregisterDeeplinkListener = () => {
    HanselTrackerRn.removeListener('HanselDeeplinkEvent');
    setDeeplinkListenerActive(false);
  };

  const statusBarH = StatusBar.currentHeight ?? 0;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" translucent={false} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? statusBarH + 10 : insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerBrand}>
          <View style={styles.logoCircle}><Text style={styles.logoLetter}>N</Text></View>
          <View>
            <Text style={styles.headerTitle}>Product Experience</Text>
            <Text style={styles.headerSub}>Hansel · Nudges SDK</Text>
          </View>
        </View>
        <View style={styles.sdkBadge}>
          <View style={styles.sdkDot} />
          <Text style={styles.sdkBadgeText}>PX</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Carousel */}
        <View>
          <FlatList
            ref={carouselRef}
            data={DEMO_BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => <BannerSlide item={item} />}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentIndex(idx);
              startAutoScroll();
            }}
            onScrollBeginDrag={() => { if (autoScrollTimer.current) clearInterval(autoScrollTimer.current); }}
          />
          <View style={styles.dotsRow}>
            {DEMO_BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* PX Feature Grid */}
        <View style={styles.featureDashboard}>
          <Text style={styles.featureDashTitle}>PX SDK Features</Text>
          <View style={styles.featureGrid}>
            {[
              { icon: 'radio-outline',         color: NC_RED,    label: 'Hansel Events',   desc: 'Nudge impressions & taps',  active: eventListenerActive },
              { icon: 'link-outline',           color: '#7C3AED', label: 'Deeplink Router', desc: 'CTA link routing',           active: deeplinkListenerActive },
              { icon: 'phone-portrait-outline', color: '#0EA5E9', label: 'Screen Tracking', desc: 'onSetScreen lifecycle',      active: true },
              { icon: 'analytics-outline',      color: '#10B981', label: 'CE Analytics',    desc: 'Auto-forwarded to CE',      active: true },
              { icon: 'cog-outline',            color: '#F59E0B', label: 'Remote Configs',  desc: 'getString / getBoolean',    active: true },
              { icon: 'person-outline',         color: '#6366F1', label: 'PX Identity',     desc: 'setUserId / clear',         active: true },
            ].map((feat, i) => (
              <View key={i} style={styles.featureTile}>
                <View style={[styles.featureTileIconBox, { backgroundColor: feat.color + '15' }]}>
                  <Ionicons name={feat.icon} size={18} color={feat.color} />
                </View>
                <Text style={styles.featureTileLabel}>{feat.label}</Text>
                <Text style={styles.featureTileDesc}>{feat.desc}</Text>
                <View style={[styles.featureTileBadge, { backgroundColor: feat.active ? feat.color + '15' : '#F3F4F6' }]}>
                  <View style={[styles.featureTileDot, { backgroundColor: feat.active ? feat.color : '#D1D5DB' }]} />
                  <Text style={[styles.featureTileBadgeText, { color: feat.active ? feat.color : '#9CA3AF' }]}>
                    {feat.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hansel Event Listener */}
        <View style={styles.listenerSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: NC_RED + '15' }]}>
              <Ionicons name="radio-outline" size={20} color={NC_RED} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sectionTitle}>Hansel Event Listener</Text>
              <Text style={styles.sectionDesc}>Track nudge impressions &amp; interactions</Text>
            </View>
            <StatusBadge active={eventListenerActive} />
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, styles.toggleBtnPrimary, eventListenerActive && styles.toggleBtnDisabled]}
              onPress={registerEventListener} disabled={eventListenerActive} activeOpacity={0.8}>
              <Ionicons name="play-circle-outline" size={16} color={eventListenerActive ? '#9CA3AF' : '#FFFFFF'} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleBtnText, eventListenerActive && { color: '#9CA3AF' }]}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, styles.toggleBtnOutline, !eventListenerActive && styles.toggleBtnDisabled]}
              onPress={deregisterEventListener} disabled={!eventListenerActive} activeOpacity={0.8}>
              <Ionicons name="stop-circle-outline" size={16} color={!eventListenerActive ? '#9CA3AF' : NC_RED} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleBtnTextOutline, !eventListenerActive && { color: '#9CA3AF' }]}>Deregister</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lastInfoRow}>
            <View style={[styles.liveDotSmall, eventListenerActive && styles.liveDotSmallActive]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.lastInfoLabel}>Last Event</Text>
              <Text style={styles.lastInfoValue} numberOfLines={1}>
                {lastEvent ? lastEvent.name : eventListenerActive ? 'Waiting for nudge events…' : 'Register to start listening'}
              </Text>
              {lastEvent?.payload && <Text style={styles.lastInfoPayload} numberOfLines={1}>{lastEvent.payload}</Text>}
            </View>
            {lastEvent && <Text style={styles.lastInfoTime}>{lastEvent.time}</Text>}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.sectionDividerLine} />
          <View style={styles.sectionDividerDot} />
          <View style={styles.sectionDividerLine} />
        </View>

        {/* Hansel Deeplink Listener */}
        <View style={styles.listenerSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#7C3AED15' }]}>
              <Ionicons name="link-outline" size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sectionTitle}>Hansel Deeplink Listener</Text>
              <Text style={styles.sectionDesc}>Capture CTA deeplinks from nudge actions</Text>
            </View>
            <StatusBadge active={deeplinkListenerActive} color="#7C3AED" />
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: deeplinkListenerActive ? '#E5E5E5' : '#7C3AED' }, deeplinkListenerActive && styles.toggleBtnDisabled]}
              onPress={registerDeeplinkListener} disabled={deeplinkListenerActive} activeOpacity={0.8}>
              <Ionicons name="play-circle-outline" size={16} color={deeplinkListenerActive ? '#9CA3AF' : '#FFFFFF'} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleBtnText, deeplinkListenerActive && { color: '#9CA3AF' }]}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, { borderWidth: 1.5, borderColor: !deeplinkListenerActive ? '#E5E5E5' : '#7C3AED', backgroundColor: 'transparent' }, !deeplinkListenerActive && styles.toggleBtnDisabled]}
              onPress={deregisterDeeplinkListener} disabled={!deeplinkListenerActive} activeOpacity={0.8}>
              <Ionicons name="stop-circle-outline" size={16} color={!deeplinkListenerActive ? '#9CA3AF' : '#7C3AED'} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleBtnText, { color: !deeplinkListenerActive ? '#9CA3AF' : '#7C3AED' }]}>Deregister</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.lastInfoRow, { borderLeftColor: '#7C3AED40' }]}>
            <View style={[styles.liveDotSmall, deeplinkListenerActive && { backgroundColor: '#7C3AED' }]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.lastInfoLabel}>Last Deeplink</Text>
              <Text style={[styles.lastInfoValue, !!lastDeeplink && { color: '#7C3AED' }]} numberOfLines={2} selectable>
                {lastDeeplink || (deeplinkListenerActive ? 'Waiting for nudge deeplinks…' : 'Register to start listening')}
              </Text>
            </View>
          </View>
        </View>


      </ScrollView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ active, color = NC_RED }) {
  return (
    <View style={[badge.pill, { backgroundColor: active ? color + '18' : '#F3F4F6' }]}>
      <View style={[badge.dot, { backgroundColor: active ? color : '#D1D5DB' }]} />
      <Text style={[badge.text, { color: active ? color : '#9CA3AF' }]}>{active ? 'ON' : 'OFF'}</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  text: { fontSize: 12, fontWeight: '700' },
});

function BannerSlide({ item }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!item.mediaUrl && !imgError;
  const initial = item.title.trim().split(' ').slice(0, 2).join('').substring(0, 2).toUpperCase();

  return (
    <View style={[styles.bannerSlide, { backgroundColor: item.backgroundColor }]}>
      {hasImage ? (
        <Image source={{ uri: item.mediaUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setImgError(true)} />
      ) : (
        <Text style={styles.bannerInitial}>{initial}</Text>
      )}
      {hasImage && <View style={styles.bannerOverlay} />}
      <View style={styles.bannerContent}>
        {!!item.title && <Text style={styles.bannerTitle}>{item.title}</Text>}
        {!!item.message && <Text style={styles.bannerMessage}>{item.message}</Text>}
        {!!item.ctaLabel && (
          <View style={[styles.bannerCta, { backgroundColor: item.ctaBgColor }]}>
            <Text style={[styles.bannerCtaText, { color: item.ctaTextColor }]}>{item.ctaLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    backgroundColor: NC_RED, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 16,
    elevation: 4, shadowColor: NC_RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  backBtn: { marginRight: 12 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoLetter: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  sdkBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  sdkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A7F3D0', marginRight: 5 },
  sdkBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  scroll: { paddingTop: 0 },

  bannerSlide: { width: SCREEN_WIDTH, height: 200, justifyContent: 'flex-end', overflow: 'hidden' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  bannerContent: { padding: 20, paddingBottom: 24 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  bannerMessage: { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginBottom: 14 },
  bannerCta: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  bannerCtaText: { fontSize: 12, fontWeight: '700' },
  bannerInitial: { position: 'absolute', top: '12%', width: '100%', textAlign: 'center', fontSize: 90, fontWeight: '900', color: 'rgba(255,255,255,0.1)' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, backgroundColor: '#FFFFFF', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5E5E5' },
  dotActive: { width: 20, backgroundColor: NC_RED },

  featureDashboard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 16, elevation: 3 },
  featureDashTitle: { fontSize: 13, fontWeight: '800', color: NC_DARK, marginBottom: 14, letterSpacing: 0.3 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureTile: { width: '47%', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12 },
  featureTileIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureTileLabel: { fontSize: 12, fontWeight: '700', color: NC_DARK, marginBottom: 2 },
  featureTileDesc: { fontSize: 10, color: NC_MUTED, lineHeight: 14, marginBottom: 8 },
  featureTileBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  featureTileDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  featureTileBadgeText: { fontSize: 10, fontWeight: '700' },

  listenerSection: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 18, elevation: 3 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIconBox: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: NC_DARK },
  sectionDesc: { fontSize: 12, color: NC_MUTED, marginTop: 2, lineHeight: 16 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 12 },
  toggleBtnPrimary: { backgroundColor: NC_RED },
  toggleBtnOutline: { borderWidth: 1.5, borderColor: NC_RED, backgroundColor: 'transparent' },
  toggleBtnDisabled: { opacity: 0.45 },
  toggleBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toggleBtnTextOutline: { color: NC_RED, fontSize: 14, fontWeight: '700' },
  lastInfoRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: NC_RED + '40' },
  liveDotSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginTop: 3, flexShrink: 0 },
  liveDotSmallActive: { backgroundColor: '#10B981' },
  lastInfoLabel: { fontSize: 10, fontWeight: '700', color: NC_MUTED, letterSpacing: 0.5, marginBottom: 3 },
  lastInfoValue: { fontSize: 13, fontWeight: '600', color: NC_DARK },
  lastInfoPayload: { fontSize: 11, color: NC_MUTED, marginTop: 3, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  lastInfoTime: { fontSize: 10, color: '#9CA3AF', marginLeft: 8, marginTop: 2, flexShrink: 0 },

  sectionDivider: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 28, marginVertical: 4 },
  sectionDividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  sectionDividerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5E5', marginHorizontal: 10 },

});
