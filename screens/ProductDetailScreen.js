import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartechBaseReact from 'smartech-base-react-native';
import { useShop } from '../store/ShopContext';

const NC_RED = '#E11D48';

export default function ProductDetailScreen({ navigation, route }) {
  const { product } = route.params;
  const { addToCart, addToWishlist, isInWishlist } = useShop();
  const insets = useSafeAreaInsets();

  const handleAddToCart = () => {
    addToCart(product);
    SmartechBaseReact.trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: String(product.price),
      qty: '1',
    });
    Alert.alert('Added to Cart ✓', product.name);
  };

  const handleWishlist = () => {
    const alreadyWishlisted = isInWishlist(product.id);
    addToWishlist(product);
    if (alreadyWishlisted) {
      SmartechBaseReact.trackEvent('remove_from_wishlist', {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: String(product.price),
      });
    } else {
      SmartechBaseReact.trackEvent('add_to_wishlist', {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: String(product.price),
      });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity onPress={handleWishlist}>
          <Text style={{ fontSize: 22 }}>{isInWishlist(product.id) ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>{product.image}</Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.brand}>{product.brand}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {product.rating}</Text>
            <Text style={styles.reviews}> (120 reviews)</Text>
          </View>
          <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Smartech tracking info */}
        <View style={styles.trackCard}>
          <Text style={styles.trackTitle}>📊 Smartech Tracking</Text>
          {[
            { label: 'product_viewed', desc: 'Fired on screen load' },
            { label: 'add_to_cart', desc: 'Fired on Add to Cart' },
            { label: 'add_to_wishlist', desc: 'Fired when added to wishlist' },
            { label: 'remove_from_wishlist', desc: 'Fired when removed from wishlist' },
          ].map(t => (
            <View key={t.label} style={styles.trackRow}>
              <Text style={styles.trackEvent}>{t.label}</Text>
              <Text style={styles.trackDesc}>{t.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: '#F0F0F0', flex: 1 }]} onPress={handleWishlist}>
          <Text style={[styles.ctaBtnText, { color: '#1A1A2E' }]}>{isInWishlist(product.id) ? '❤️ Wishlisted' : '🤍 Wishlist'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: NC_RED, flex: 2 }]} onPress={handleAddToCart}>
          <Text style={styles.ctaBtnText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  back: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 120 },
  heroCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', marginBottom: 12, elevation: 2,
  },
  heroEmoji: { fontSize: 80 },
  categoryChip: {
    marginTop: 12, backgroundColor: NC_RED + '18',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4,
  },
  categoryChipText: { fontSize: 12, fontWeight: '700', color: NC_RED },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  productName: { fontSize: 20, fontWeight: '900', color: '#1A1A2E' },
  brand: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rating: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  reviews: { fontSize: 13, color: '#9CA3AF' },
  price: { fontSize: 26, fontWeight: '900', color: NC_RED, marginTop: 10 },
  description: { fontSize: 14, color: '#6C757D', lineHeight: 22, marginTop: 10 },
  trackCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 12 },
  trackTitle: { fontSize: 13, fontWeight: '800', color: '#1A1A2E', marginBottom: 10 },
  trackRow: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DBEAFE' },
  trackEvent: { fontSize: 12, fontWeight: '700', color: '#3B82F6', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  trackDesc: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5E5',
  },
  ctaBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
