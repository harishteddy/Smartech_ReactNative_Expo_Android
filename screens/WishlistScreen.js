import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Platform,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { useShop } from '../store/ShopContext';

const NC_RED = '#E11D48';

export default function WishlistScreen({ navigation }) {
  const { wishlist, addToWishlist, addToCart } = useShop();

  const handleAddToCart = (item) => {
    addToCart(item);
    SmartechBaseReact.trackEvent('add_to_cart_from_wishlist', { product_id: item.id, name: item.name });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.emoji}>{item.image}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cartBtn} onPress={() => handleAddToCart(item)}>
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addToWishlist(item)}>
          <Text style={{ fontSize: 20 }}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist ({wishlist.length})</Text>
        <View style={{ width: 28 }} />
      </View>
      <FlatList
        data={wishlist}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🤍</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
          </View>
        }
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
  list: { padding: 14, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2,
  },
  emoji: { fontSize: 36 },
  name: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  brand: { fontSize: 11, color: '#9CA3AF' },
  price: { fontSize: 14, fontWeight: '800', color: NC_RED, marginTop: 4 },
  actions: { alignItems: 'center', gap: 8 },
  cartBtn: { backgroundColor: NC_RED, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  cartBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#6C757D' },
});
