import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Image, FlatList, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartechBaseReact from 'smartech-base-react-native';
import { HanselRn } from 'smartech-reactnative-nudges';
import { Ionicons } from '@expo/vector-icons';
import { ALL_PRODUCTS, useShop } from '../store/ShopContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PZ_GREEN = '#10B981';
const NC_RED   = '#E11D48';
const NC_DARK  = '#1A1A2E';
const NC_MUTED = '#6C757D';

// ── Demo banners shown until live widget data arrives ─────────────────────────
const DEMO_BANNERS = [
  {
    widgetRef: null,
    title: 'App Personalization',
    message: 'Content served dynamically from Smartech widget data',
    mediaUrl: '',
    deeplinkUrl: '',
    backgroundColor: PZ_GREEN,
    ctaLabel: 'Personalised',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: PZ_GREEN,
  },
  {
    widgetRef: null,
    title: 'Smart Recommendations',
    message: 'Widget-driven banners adapt to each user in real time',
    mediaUrl: '',
    deeplinkUrl: '',
    backgroundColor: '#F59E0B',
    ctaLabel: 'Live',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: '#F59E0B',
  },
  {
    widgetRef: null,
    title: 'Track & Convert',
    message: 'Widget impressions and clicks sent to CE analytics',
    mediaUrl: '',
    deeplinkUrl: '',
    backgroundColor: '#3B82F6',
    ctaLabel: 'Tracking',
    ctaBgColor: '#FFFFFF',
    ctaTextColor: '#3B82F6',
  },
];

// ── Widget data parser ────────────────────────────────────────────────────────
//
// Native SDK sends data as:
// {
//   "community_carousel": {
//     layoutType: "json",          ← key field
//     widgetName, widgetId, campaignId, audienceId, contentId,
//     content: {
//       title, message, mediaUrl, deeplinkUrl, backgroundColor,   ← empty for layoutType=json
//       actionButtons: [],
//       customKeyValueParams: {
//         "json": '{"banners":[{title,message,mediaUrl,deeplinkUrl,actionButtons,backgroundColor}]}'
//       }                          ← payloadAsJson is stored here as stringified JSON
//     },
//     customKeyValueParams: {},
//     gaParams: {}
//   }
// }
//
// For layoutType="json": real data is in content.customKeyValueParams.json (a JSON string)
// For other layouts:      real data is in content.title / content.message / etc.

function mapBannerItem(b, widgetRef) {
  return {
    widgetRef,
    title:           b.title           ?? b.heading     ?? b.name    ?? '',
    message:         b.message         ?? b.description ?? b.body    ?? '',
    mediaUrl:        b.mediaUrl        ?? b.imageUrl    ?? b.image   ?? '',
    deeplinkUrl:     b.deeplinkUrl     ?? b.deeplink    ?? b.url     ?? '',
    backgroundColor: b.backgroundColor || b.bgColor || PZ_GREEN,
    ctaLabel:        b.actionButtons?.[0]?.actionName      ?? '',
    ctaBgColor:      b.actionButtons?.[0]?.backgroundColor ?? '#FFFFFF',
    ctaTextColor:    b.actionButtons?.[0]?.textColor       ?? PZ_GREEN,
  };
}

function parseWidgetBanners(data) {
  try {
    console.log('[AppPZ] Raw widget data:', JSON.stringify(data));

    if (!data || typeof data !== 'object') {
      console.warn('[AppPZ] Widget data is null or not an object');
      return [];
    }

    const keys = Object.keys(data);
    console.log('[AppPZ] Widget keys:', keys);

    if (keys.length === 0) {
      console.warn('[AppPZ] No widgets in data');
      return [];
    }

    const allBanners = [];

    for (const key of keys) {
      const widget = data[key];
      if (!widget) continue;

      const layoutType = widget.layoutType ?? '';
      const content    = widget.content ?? {};
      console.log(`[AppPZ] Widget "${key}" layoutType="${layoutType}" content:`, JSON.stringify(content));

      // ── PATH 1: layoutType=json → banners are in content.customKeyValueParams.json ──
      if (layoutType === 'json') {
        const cvp = content.customKeyValueParams ?? {};
        // The SDK stores payloadAsJson values as stringified JSON strings
        for (const [cvpKey, cvpVal] of Object.entries(cvp)) {
          console.log(`[AppPZ] customKeyValueParams["${cvpKey}"] =`, cvpVal);
          try {
            const parsed = typeof cvpVal === 'string' ? JSON.parse(cvpVal) : cvpVal;
            // payloadAsJson = { "json": { "banners": [...] } }
            // after stringification cvpKey="json" and parsed = { "banners": [...] }
            const banners = parsed?.banners ?? (Array.isArray(parsed) ? parsed : null);
            if (Array.isArray(banners) && banners.length > 0) {
              console.log(`[AppPZ] Found ${banners.length} banner(s) in "${key}.content.customKeyValueParams.${cvpKey}"`);
              allBanners.push(...banners.map(b => mapBannerItem(b, widget)));
              break;
            }
          } catch (_) {}
        }

        // Also check widget-level customKeyValueParams as fallback
        if (allBanners.length === 0) {
          const wcvp = widget.customKeyValueParams ?? {};
          for (const [k, v] of Object.entries(wcvp)) {
            try {
              const parsed = typeof v === 'string' ? JSON.parse(v) : v;
              const banners = parsed?.banners ?? (Array.isArray(parsed) ? parsed : null);
              if (Array.isArray(banners) && banners.length > 0) {
                console.log(`[AppPZ] Found ${banners.length} banner(s) in "${key}.customKeyValueParams.${k}"`);
                allBanners.push(...banners.map(b => mapBannerItem(b, widget)));
                break;
              }
            } catch (_) {}
          }
        }
        continue; // done with this widget
      }

      // ── PATH 2: standard layout → direct content fields ──
      if (content.title || content.mediaUrl || content.message) {
        const ab = Array.isArray(content.actionButtons) && content.actionButtons.length > 0
          ? content.actionButtons[0] : null;
        allBanners.push({
          widgetRef:       widget,
          title:           content.title           ?? '',
          message:         content.message         ?? '',
          mediaUrl:        content.mediaUrl        ?? '',
          deeplinkUrl:     ab?.actionDeeplink       ?? content.deeplinkUrl ?? '',
          backgroundColor: content.backgroundColor || PZ_GREEN,
          ctaLabel:        ab?.actionName           ?? '',
          ctaBgColor:      ab?.backgroundColor      ?? '#FFFFFF',
          ctaTextColor:    ab?.textColor            ?? PZ_GREEN,
        });
        continue;
      }

      console.warn(`[AppPZ] Widget "${key}" had no parseable content`);
    }

    console.log(`[AppPZ] Total banners parsed: ${allBanners.length}`);
    return allBanners;
  } catch (e) {
    console.error('[AppPZ] parseWidgetBanners error:', e);
    return [];
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AppPZScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { cart, addToCart, addToWishlist, isInWishlist } = useShop();
  const isInCart = (id) => cart.some(i => i.id === id);

  const carouselRef = useRef(null);
  const autoScrollTimer = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState(DEMO_BANNERS);
  const [isLiveData, setIsLiveData] = useState(false);
  const [widgetNames, setWidgetNames] = useState([]);
  const [statusMsg, setStatusMsg] = useState('Demo content · Tap Sync to load live data');

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  const startAutoScroll = useCallback((count) => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    if (count <= 1) return;
    autoScrollTimer.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % count;
        carouselRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    startAutoScroll(banners.length);
    return () => { if (autoScrollTimer.current) clearInterval(autoScrollTimer.current); };
  }, [banners.length, startAutoScroll]);

  // ── Fetch widgets ─────────────────────────────────────────────────────────

  const fetchWidgets = useCallback(() => {
    setStatusMsg('Fetching widget names...');
    console.log('[AppPZ] Fetching all widget names...');

    SmartechBaseReact.getAllWidgetNames((err, res) => {
      if (err) {
        console.warn('[AppPZ] getAllWidgetNames error:', err);
        setStatusMsg('No widgets found · Check Smartech CE panel');
        // Fallback: try getAllWidgets directly
        console.log('[AppPZ] Falling back to getAllWidgets()');
        SmartechBaseReact.getAllWidgets();
        return;
      }

      console.log('[AppPZ] getAllWidgetNames result:', JSON.stringify(res));

      // res could be an array of widget name strings
      const names = Array.isArray(res) ? res : (res ? [res] : []);
      console.log('[AppPZ] Widget names:', names);
      setWidgetNames(names);

      if (names.length === 0) {
        console.warn('[AppPZ] No widget names returned, trying getAllWidgets()');
        setStatusMsg('No widgets configured · Check Smartech CE panel');
        SmartechBaseReact.getAllWidgets();
        return;
      }

      setStatusMsg(`Loading ${names.length} widget(s)...`);
      // Fetch all widgets by their names
      SmartechBaseReact.getWidgetByNames(names);
    });
  }, []);

  // ── Widget listener ───────────────────────────────────────────────────────

  useEffect(() => {
    HanselRn.onSetScreen('AppPZ');
    SmartechBaseReact.trackEvent('screen_load', { screen: 'app_personalization' });

    // Register listener BEFORE fetching
    const subscription = SmartechBaseReact.addListener(
      SmartechBaseReact.SmartechWidgetDataReceived,
      (data) => {
        console.log('[AppPZ] SmartechWidgetDataReceived fired');
        const parsed = parseWidgetBanners(data);

        if (parsed.length > 0) {
          console.log('[AppPZ] Setting live banners:', parsed.length);
          setBanners(parsed);
          setIsLiveData(true);
          setStatusMsg('Live widget data loaded');
          setCurrentIndex(0);
          carouselRef.current?.scrollToOffset({ offset: 0, animated: false });
          // Track first banner as viewed
          if (parsed[0].widgetRef) {
            SmartechBaseReact.trackWidgetAsViewed(parsed[0].widgetRef);
          }
        } else {
          console.warn('[AppPZ] Received widget data but parsed 0 banners');
          setStatusMsg('Widgets received but no content · Check widget setup');
        }
      }
    );

    // Fetch after listener is registered
    fetchWidgets();

    return () => {
      HanselRn.onUnsetScreen();
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      } else {
        SmartechBaseReact.removeListener(SmartechBaseReact.SmartechWidgetDataReceived);
      }
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, []);

  const syncContent = () => {
    setIsLiveData(false);
    setBanners(DEMO_BANNERS);
    fetchWidgets();
  };

  // ── Track viewed when carousel scrolls ───────────────────────────────────

  const onCarouselScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(idx);
    startAutoScroll(banners.length);
    // Track widget viewed when it becomes visible
    if (isLiveData && banners[idx]?.widgetRef) {
      SmartechBaseReact.trackWidgetAsViewed(banners[idx].widgetRef);
    }
  };

  // ── Handle CTA click ──────────────────────────────────────────────────────

  const onBannerCtaPress = (banner) => {
    if (isLiveData && banner.widgetRef) {
      SmartechBaseReact.trackWidgetAsClicked(banner.widgetRef);
    }
    if (banner.deeplinkUrl) {
      SmartechBaseReact.trackEvent('widget_cta_clicked', { deeplink: banner.deeplinkUrl });
    }
  };

  const onProductPress = (product) => {
    SmartechBaseReact.trackEvent('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: String(product.price),
    });
    navigation.navigate('ProductDetail', { product });
  };

  const forYou   = ALL_PRODUCTS.slice(0, 6);
  const trending = ALL_PRODUCTS.slice(3, 7);
  const statusBarH = StatusBar.currentHeight ?? 0;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PZ_GREEN} barStyle="light-content" translucent={false} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? statusBarH + 8 : insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>App Personalization</Text>
          <Text style={styles.headerSub}>Smartech CE · Widget Content</Text>
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={syncContent} activeOpacity={0.8}>
          <Ionicons name="sync-outline" size={15} color={PZ_GREEN} />
          <Text style={styles.syncBtnText}>Sync</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>

        {/* Hero Carousel */}
        <View>
          <FlatList
            ref={carouselRef}
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <BannerSlide item={item} onCtaPress={() => onBannerCtaPress(item)} />
            )}
            onMomentumScrollEnd={onCarouselScroll}
            onScrollBeginDrag={() => {
              if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
            }}
          />
          {/* Dots */}
          <View style={styles.dotsRow}>
            {banners.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
          {/* Live pill */}
          <View style={styles.liveRow}>
            <View style={[styles.liveDot, isLiveData && styles.liveDotActive]} />
            <Text style={styles.liveText}>{statusMsg}</Text>
          </View>
        </View>

        {/* Personalised For You */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="sparkles-outline" size={15} color={PZ_GREEN} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Personalised For You</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {forYou.map(product => (
            <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => onProductPress(product)} activeOpacity={0.88}>
              <View style={styles.imageWrap}>
                <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                {product.badge && (
                  <View style={[styles.productBadge, { backgroundColor: product.badge === 'Sale' ? NC_RED : product.badge === 'New' ? PZ_GREEN : '#F59E0B' }]}>
                    <Text style={styles.productBadgeText}>{product.badge}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.wishlistBtn} onPress={() => addToWishlist(product)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name={isInWishlist(product.id) ? 'heart' : 'heart-outline'} size={16} color={isInWishlist(product.id) ? NC_RED : '#FFFFFF'} />
                </TouchableOpacity>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
                  {product.originalPrice > product.price && (
                    <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Now */}
        <View style={[styles.sectionRow, { marginTop: 20 }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="trending-up-outline" size={15} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
          {trending.map(product => (
            <TouchableOpacity key={product.id} style={styles.trendingCard} onPress={() => onProductPress(product)} activeOpacity={0.88}>
              <Image source={{ uri: product.image }} style={styles.trendingImage} resizeMode="cover" />
              {product.badge && (
                <View style={[styles.trendingBadge, { backgroundColor: product.badge === 'Sale' ? NC_RED : product.badge === 'New' ? PZ_GREEN : '#F59E0B' }]}>
                  <Text style={styles.trendingBadgeText}>{product.badge}</Text>
                </View>
              )}
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingBrand}>{product.brand}</Text>
                <Text style={styles.trendingName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.trendingPrice}>₹{product.price.toLocaleString('en-IN')}</Text>
                <TouchableOpacity
                  style={[styles.addCartBtn, isInCart(product.id) && { backgroundColor: PZ_GREEN }]}
                  onPress={() => isInCart(product.id) ? navigation.navigate('Cart') : addToCart(product)}
                  activeOpacity={0.85}>
                  <Ionicons name={isInCart(product.id) ? 'bag-check-outline' : 'bag-add-outline'} size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.addCartText}>{isInCart(product.id) ? 'In Cart' : 'Add to Cart'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </View>
  );
}

// ── Banner Slide ──────────────────────────────────────────────────────────────

function BannerSlide({ item, onCtaPress }) {
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
          <TouchableOpacity
            style={[styles.bannerCta, { backgroundColor: item.ctaBgColor }]}
            onPress={onCtaPress}
            activeOpacity={0.85}>
            <Text style={[styles.bannerCtaText, { color: item.ctaTextColor }]}>{item.ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    backgroundColor: PZ_GREEN, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 14,
    elevation: 4, shadowColor: PZ_GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  syncBtnText: { fontSize: 12, fontWeight: '700', color: PZ_GREEN },

  bannerSlide: { width: SCREEN_WIDTH, height: 220, justifyContent: 'flex-end', overflow: 'hidden' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  bannerContent: { padding: 20, paddingBottom: 26 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 6 },
  bannerMessage: { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginBottom: 14, lineHeight: 18 },
  bannerCta: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  bannerCtaText: { fontSize: 12, fontWeight: '800' },
  bannerInitial: { position: 'absolute', top: '15%', width: '100%', textAlign: 'center', fontSize: 90, fontWeight: '900', color: 'rgba(255,255,255,0.12)' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, backgroundColor: '#FFFFFF', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5E5E5' },
  dotActive: { width: 22, backgroundColor: PZ_GREEN },
  liveRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB' },
  liveDotActive: { backgroundColor: PZ_GREEN },
  liveText: { fontSize: 11, color: '#9CA3AF' },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: NC_DARK },
  seeAll: { fontSize: 13, color: PZ_GREEN, fontWeight: '700' },

  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  productCard: { width: (SCREEN_WIDTH - 34) / 2, backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', elevation: 2 },
  imageWrap: { position: 'relative' },
  productImage: { width: '100%', height: 150 },
  productBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  productBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  wishlistBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 10 },
  productBrand: { fontSize: 9, color: NC_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 13, fontWeight: '700', color: NC_DARK, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  price: { fontSize: 14, fontWeight: '800', color: NC_DARK },
  originalPrice: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },

  trendingScroll: { paddingHorizontal: 14, gap: 12 },
  trendingCard: { width: 160, backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', elevation: 2 },
  trendingImage: { width: '100%', height: 130 },
  trendingBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  trendingBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  trendingInfo: { padding: 10 },
  trendingBrand: { fontSize: 9, color: NC_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendingName: { fontSize: 12, fontWeight: '700', color: NC_DARK, marginTop: 2, lineHeight: 17 },
  trendingPrice: { fontSize: 13, fontWeight: '800', color: NC_DARK, marginTop: 4 },
  addCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: NC_RED, borderRadius: 8, paddingVertical: 7, marginTop: 8 },
  addCartText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
