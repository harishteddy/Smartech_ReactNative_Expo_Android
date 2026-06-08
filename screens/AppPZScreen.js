import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, StatusBar, Image, FlatList, Dimensions, Linking,
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

// ── Widget banner parser ──────────────────────────────────────────────────────
// The SDK emits a MAP of {widgetName: widgetData} — not a single widget object.
// We iterate every key, parse each widget's banners, then deduplicate by widgetName.

// layoutType is carried into each banner so BannerSlide can render appropriately:
//   "image"  → full-width image with CTA pill overlaid at bottom
//   "json"   → text+image card (may or may not have a mediaUrl)
//   "text"   → colour background + text only

function mapBannerItem(b, layoutType = 'json') {
  return {
    layoutType,
    title:           b.title       ?? b.heading     ?? b.name    ?? '',
    message:         b.message     ?? b.description ?? b.body    ?? '',
    mediaUrl:        b.mediaUrl    ?? b.imageUrl    ?? b.image   ?? '',
    deeplinkUrl:     b.deeplinkUrl ?? b.deeplink    ?? b.url     ?? '',
    backgroundColor: b.backgroundColor || b.bgColor || PZ_GREEN,
    ctaLabel:        b.actionButtons?.[0]?.actionName      ?? '',
    ctaBgColor:      b.actionButtons?.[0]?.backgroundColor ?? '#FFFFFF',
    ctaTextColor:    b.actionButtons?.[0]?.textColor       ?? PZ_GREEN,
  };
}

function parseSingleWidget(widget) {
  if (!widget) return [];

  const layoutType = widget?.layoutType ?? 'json';

  // Path 1 — content.json (populated after the Kotlin native bridge fix)
  // Used by layoutType:"json" widgets whose banners array lives in SMTWidgetContent.json
  const rawJson = widget?.content?.json;
  if (rawJson) {
    try {
      const json = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      const arr = json?.banners;
      if (Array.isArray(arr) && arr.length > 0) {
        console.log('[CPZ] Path1 content.json banners =', arr.length, 'layoutType =', layoutType);
        return arr.map(b => mapBannerItem(b, layoutType));
      }
      // root-level array e.g. [{...},{...}]
      if (Array.isArray(json) && json.length > 0) {
        console.log('[CPZ] Path1 content.json root-array =', json.length);
        return json.map(b => mapBannerItem(b, layoutType));
      }
    } catch (e) {
      console.warn('[CPZ] content.json parse error:', e);
    }
  }

  // Path 2 — customKeyValueParams (JSON strings / nested objects)
  for (const params of [widget?.content?.customKeyValueParams, widget?.customKeyValueParams]) {
    if (!params || typeof params !== 'object') continue;
    for (const val of Object.values(params)) {
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try {
          const decoded = JSON.parse(val);
          const arr = decoded?.banners ?? (Array.isArray(decoded) ? decoded : null);
          if (Array.isArray(arr) && arr.length > 0) {
            console.log('[CPZ] Path2 customKV banners =', arr.length);
            return arr.map(b => mapBannerItem(b, layoutType));
          }
        } catch (_) {}
      } else if (val && typeof val === 'object') {
        const arr = val?.banners;
        if (Array.isArray(arr) && arr.length > 0) {
          return arr.map(b => mapBannerItem(b, layoutType));
        }
      }
    }
  }

  // Path 3 — standard content fields
  // Handles layoutType:"image" (single mediaUrl) and layoutType:"text" (title/message only)
  const c = widget?.content;
  if (c?.mediaUrl || c?.title) {
    const ab = c?.actionButtons?.[0];
    const lt = c?.mediaUrl ? (layoutType || 'image') : 'text';
    console.log('[CPZ] Path3 standard content, layoutType =', lt, 'mediaUrl =', !!c?.mediaUrl);
    return [{
      layoutType:      lt,
      title:           c.title           ?? '',
      message:         c.message         ?? '',
      mediaUrl:        c.mediaUrl        ?? '',
      deeplinkUrl:     ab?.actionDeeplink ?? c.deeplinkUrl ?? '',
      backgroundColor: c.backgroundColor || PZ_GREEN,
      ctaLabel:        ab?.actionName     ?? '',
      ctaBgColor:      ab?.backgroundColor ?? '#FFFFFF',
      ctaTextColor:    ab?.textColor       ?? PZ_GREEN,
    }];
  }

  return [];
}

function parseWidgetBanners(data) {
  try {
    const keys = Object.keys(data ?? {});
    console.log('[CPZ] parseWidgetBanners: widget keys =', keys);

    const all = [];
    const processedWidgetNames = new Set();

    for (const key of keys) {
      const widget = data[key];
      const canonicalName = (widget?.widgetName ?? key).trim();

      if (processedWidgetNames.has(canonicalName)) {
        console.log(`[CPZ] "${key}" skipped — duplicate of "${canonicalName}"`);
        continue;
      }
      processedWidgetNames.add(canonicalName);

      const banners = parseSingleWidget(widget);
      console.log(`[CPZ] "${canonicalName}" → ${banners.length} banner(s) parsed`);
      all.push(...banners);
    }

    console.log(
      `[CPZ] final banner count: ${all.length} ` +
      `(from ${processedWidgetNames.size} unique widget(s): ${[...processedWidgetNames].join(', ')})`
    );
    return all;
  } catch (e) {
    console.warn('[CPZ] parseWidgetBanners error:', e);
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

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  const startAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % banners.length;
        carouselRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 3000);
  }, [banners.length]);

  useEffect(() => {
    startAutoScroll();
    return () => { if (autoScrollTimer.current) clearInterval(autoScrollTimer.current); };
  }, [startAutoScroll]);

  // ── Widget listener ───────────────────────────────────────────────────────

  useEffect(() => {
    HanselRn.onSetScreen('AppPZ');
    SmartechBaseReact.trackEvent('screen_load', { screen: 'app_personalization' });

    SmartechBaseReact.addListener(
      SmartechBaseReact.SmartechWidgetDataReceived,
      (data) => {
        console.log('[CPZ] SmartechWidgetDataReceived raw ::', JSON.stringify(data));
        const parsed = parseWidgetBanners(data);
        console.log('[CPZ] parsed banners count =', parsed.length);
        if (parsed.length > 0) {
          setBanners(parsed);
          setIsLiveData(true);
          setCurrentIndex(0);
          carouselRef.current?.scrollToOffset({ offset: 0, animated: false });
        }
      },
    );

    // Trigger widget fetch so live data loads on screen open
    SmartechBaseReact.getAllWidgets();

    return () => {
      HanselRn.onUnsetScreen();
      SmartechBaseReact.removeListener(SmartechBaseReact.SmartechWidgetDataReceived);
    };
  }, []);

  // ── Sync button ───────────────────────────────────────────────────────────

  const syncContent = () => SmartechBaseReact.getAllWidgets();

  // ── Product press ─────────────────────────────────────────────────────────

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
            renderItem={({ item }) => <BannerSlide item={item} navigation={navigation} />}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentIndex(idx);
              startAutoScroll();
            }}
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
            <Text style={styles.liveText}>
              {isLiveData ? 'Live widget data' : 'Demo content · Tap Sync to load live data'}
            </Text>
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

// ── Deeplink handler ──────────────────────────────────────────────────────────
function openDeeplink(url, navigation) {
  if (!url) return;
  console.log('[CPZ] deeplink tapped:', url);
  const lower = url.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    Linking.openURL(url).catch(e => console.warn('[CPZ] Linking.openURL failed:', e));
  } else {
    // internal scheme — reuse the same routing logic as App.js
    if (lower.includes('profile'))       navigation.navigate('Profile');
    else if (lower.includes('event'))    navigation.navigate('Events');
    else if (lower.includes('inbox'))    navigation.navigate('CustomInbox');
    else if (lower.includes('shop'))     navigation.navigate('Shop');
    else if (lower.includes('cart'))     navigation.navigate('Cart');
    else if (lower.includes('wishlist')) navigation.navigate('Wishlist');
    else if (lower.includes('cedash'))   navigation.navigate('CEDashboard');
    else if (lower.includes('pxdash'))   navigation.navigate('PXDashboard');
    else if (lower.includes('apppz'))    navigation.navigate('AppPZ');
    else if (lower.includes('settings')) navigation.navigate('Settings');
    else if (lower.includes('device'))   navigation.navigate('DeviceInfo');
    else console.warn('[CPZ] unknown deeplink scheme:', url);
  }
}

// ── Banner Slide ──────────────────────────────────────────────────────────────
// Renders differently based on layoutType:
//   "image"  → full-width photo / product image, no dark overlay, CTA pill at bottom-right
//   "json"   → text card, image fills background with dark overlay + text on top
//   "text"   → solid colour background + text only (no image)

function BannerSlide({ item, navigation }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);

  const hasUrl      = !!item.mediaUrl;
  const showImg     = hasUrl && !imgError;
  const isImageType = item.layoutType === 'image';

  // Track click + open deeplink
  const handlePress = () => {
    if (item.deeplinkUrl) {
      SmartechBaseReact.trackWidgetAsClicked(item._widgetRaw ?? {});
      openDeeplink(item.deeplinkUrl, navigation);
    }
  };

  const handleCtaPress = () => {
    SmartechBaseReact.trackWidgetAsClicked(item._widgetRaw ?? {});
    // CTA deeplink takes precedence; fall back to banner deeplink
    const url = item.deeplinkUrl;
    if (url) openDeeplink(url, navigation);
  };

  // ── IMAGE-TYPE layout ──────────────────────────────────────────────────────
  if (isImageType) {
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handlePress}
        style={[styles.bannerSlide, { backgroundColor: item.backgroundColor || '#F3F4F6' }]}
      >
        {/* Full-size image — cover fills the entire 220px slide */}
        {showImg && (
          <Image
            source={{ uri: item.mediaUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onLoad={() => {
              setImgLoaded(true);
              console.log('[CPZ] image loaded ✓', item.mediaUrl);
            }}
            onError={() => {
              setImgError(true);
              console.warn('[CPZ] image FAILED to load ✗', item.mediaUrl);
            }}
          />
        )}

        {/* Loading shimmer */}
        {hasUrl && !imgLoaded && !imgError && (
          <View style={[StyleSheet.absoluteFill, styles.imgShimmer]} />
        )}

        {/* Broken-image placeholder */}
        {imgError && (
          <View style={styles.imgBroken}>
            <Ionicons name="image-outline" size={40} color="rgba(255,255,255,0.5)" />
            <Text style={styles.imgBrokenText}>Image unavailable</Text>
          </View>
        )}

        {/* Subtle overlay so CTA pill is always readable */}
        {showImg && <View style={styles.imgGradient} />}

        {/* CTA pill — tappable, bottom-right */}
        {!!item.ctaLabel && (
          <View style={styles.imgCtaRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCtaPress}
              style={[styles.imgCta, { backgroundColor: item.ctaBgColor }]}
            >
              <Text style={[styles.imgCtaText, { color: item.ctaTextColor }]}>{item.ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ── JSON / TEXT layout ────────────────────────────────────────────────────
  const initial = (item.title || '').trim().split(' ').slice(0, 2).join('').substring(0, 2).toUpperCase() || '✦';
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      style={[styles.bannerSlide, { backgroundColor: item.backgroundColor }]}
    >
      {showImg && (
        <Image
          source={{ uri: item.mediaUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoad={() => console.log('[CPZ] json-banner image loaded ✓')}
          onError={() => setImgError(true)}
        />
      )}
      {showImg  && <View style={styles.bannerOverlay} />}
      {!showImg && <Text style={styles.bannerInitial}>{initial}</Text>}
      <View style={styles.bannerContent}>
        {!!item.title   && <Text style={styles.bannerTitle}>{item.title}</Text>}
        {!!item.message && <Text style={styles.bannerMessage}>{item.message}</Text>}
        {!!item.ctaLabel && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCtaPress}
            style={[styles.bannerCta, { backgroundColor: item.ctaBgColor }]}
          >
            <Text style={[styles.bannerCtaText, { color: item.ctaTextColor }]}>{item.ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  syncBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  syncBtnText: { fontSize: 12, fontWeight: '700', color: PZ_GREEN },

  // ── Shared slide container ──────────────────────────────────────────────────
  bannerSlide:   { width: SCREEN_WIDTH, height: 220, justifyContent: 'flex-end', overflow: 'hidden' },

  // ── layoutType: "image" ─────────────────────────────────────────────────────
  imgShimmer:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.15)' },
  imgGradient:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  imgBroken:     { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 8 },
  imgBrokenText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  imgCtaRow:     { paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  imgCta:        { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 22 },
  imgCtaText:    { fontSize: 13, fontWeight: '800' },

  // ── layoutType: "json" / "text" ─────────────────────────────────────────────
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  bannerContent: { padding: 20, paddingBottom: 26 },
  bannerTitle:   { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 6 },
  bannerMessage: { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginBottom: 14, lineHeight: 18 },
  bannerCta:     { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  bannerCtaText: { fontSize: 12, fontWeight: '800' },
  bannerInitial: { position: 'absolute', top: '15%', width: '100%', textAlign: 'center', fontSize: 90, fontWeight: '900', color: 'rgba(255,255,255,0.12)' },

  dotsRow:       { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, backgroundColor: '#FFFFFF', gap: 6 },
  dot:           { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E5E5E5' },
  dotActive:     { width: 22, backgroundColor: PZ_GREEN },
  liveRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  liveDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB' },
  liveDotActive: { backgroundColor: PZ_GREEN },
  liveText:      { fontSize: 11, color: '#9CA3AF' },

  sectionRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle:    { fontSize: 16, fontWeight: '800', color: NC_DARK },
  seeAll:          { fontSize: 13, color: PZ_GREEN, fontWeight: '700' },

  productGrid:      { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  productCard:      { width: (SCREEN_WIDTH - 34) / 2, backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', elevation: 2 },
  imageWrap:        { position: 'relative' },
  productImage:     { width: '100%', height: 150 },
  productBadge:     { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  productBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  wishlistBtn:      { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  productInfo:      { padding: 10 },
  productBrand:     { fontSize: 9, color: NC_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName:      { fontSize: 13, fontWeight: '700', color: NC_DARK, marginTop: 2 },
  priceRow:         { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  price:            { fontSize: 14, fontWeight: '800', color: NC_DARK },
  originalPrice:    { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },

  trendingScroll:    { paddingHorizontal: 14, gap: 12 },
  trendingCard:      { width: 160, backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', elevation: 2 },
  trendingImage:     { width: '100%', height: 130 },
  trendingBadge:     { position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  trendingBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  trendingInfo:      { padding: 10 },
  trendingBrand:     { fontSize: 9, color: NC_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendingName:      { fontSize: 12, fontWeight: '700', color: NC_DARK, marginTop: 2, lineHeight: 17 },
  trendingPrice:     { fontSize: 13, fontWeight: '800', color: NC_DARK, marginTop: 4 },
  addCartBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: NC_RED, borderRadius: 8, paddingVertical: 7, marginTop: 8 },
  addCartText:       { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
