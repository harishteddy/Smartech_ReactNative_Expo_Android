import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Platform, TextInput,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { ALL_PRODUCTS, CATEGORIES, useShop } from '../store/ShopContext';

const NC_RED = '#E11D48';

export default function ShopScreen({ navigation }) {
  const { cartCount, wishlistCount, addToWishlist, isInWishlist } = useShop();
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    SmartechBaseReact.trackEvent('screen_load', { screen: 'shop' });
  }, []);

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchCat = selectedCat === 'All' || p.category === selectedCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const onProduct = (p) => {
    SmartechBaseReact.trackEvent('product_viewed', { product_id: p.id, name: p.name, price: String(p.price) });
    navigation.navigate('ProductDetail', { product: p });
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => onProduct(item)} activeOpacity={0.85}>
      <Text style={styles.productEmoji}>{item.image}</Text>
      <TouchableOpacity
        style={styles.wishBtn}
        onPress={() => {
          const alreadyWishlisted = isInWishlist(item.id);
          addToWishlist(item);
          SmartechBaseReact.trackEvent(
            alreadyWishlisted ? 'remove_from_wishlist' : 'add_to_wishlist',
            { product_id: item.id, product_name: item.name, category: item.category, price: String(item.price) }
          );
        }}
      >
        <Text style={{ fontSize: 16 }}>{isInWishlist(item.id) ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productBrand}>{item.brand}</Text>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.productPrice}>₹{item.price.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
            <Text style={styles.headerIcon}>❤️</Text>
            {wishlistCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{wishlistCount}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ marginLeft: 16 }}>
            <Text style={styles.headerIcon}>🛒</Text>
            {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput} placeholder="Search products…"
          value={search} onChangeText={setSearch} placeholderTextColor="#aaa"
        />
      </View>

      {/* Categories */}
      <View style={styles.catBar}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={i => i}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, selectedCat === item && styles.catChipActive]}
              onPress={() => setSelectedCat(item)}
            >
              <Text style={[styles.catText, selectedCat === item && styles.catTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Products */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        renderItem={renderProduct}
        columnWrapperStyle={{ gap: 12 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No products found</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: NC_RED, paddingHorizontal: 20, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  back: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { fontSize: 22 },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#fff', borderRadius: 8, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: NC_RED },
  searchWrap: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 8, fontSize: 14, color: '#1A1A2E',
  },
  catBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  catList: { paddingHorizontal: 14, paddingVertical: 10, gap: 8, alignItems: 'center' },
  catChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E5E5' },
  catChipActive: { backgroundColor: NC_RED, borderColor: NC_RED },
  catText: { fontSize: 13, fontWeight: '600', color: '#6C757D' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  productList: { padding: 14, paddingBottom: 40 },
  productCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 2, position: 'relative' },
  productEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  wishBtn: { position: 'absolute', top: 8, right: 8 },
  productName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  productBrand: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  ratingRow: { flexDirection: 'row', marginTop: 4 },
  ratingText: { fontSize: 11, color: '#F59E0B', fontWeight: '600' },
  productPrice: { fontSize: 15, fontWeight: '900', color: NC_RED, marginTop: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
