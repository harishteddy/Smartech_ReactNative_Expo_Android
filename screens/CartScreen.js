import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Platform, Alert,
} from 'react-native';
import SmartechBaseReact from 'smartech-base-react-native';
import { useShop } from '../store/ShopContext';

const NC_RED = '#E11D48';

export default function CartScreen({ navigation }) {
  const { cart, cartTotal, updateQty, removeFromCart, clearCart } = useShop();

  const handleCheckout = () => {
    if (!cart.length) { Alert.alert('Cart is empty'); return; }
    SmartechBaseReact.trackEvent('purchase', {
      order_id: `ORD${Date.now()}`,
      amount: String(cartTotal),
      currency: 'INR',
      items: cart.length.toString(),
    });
    clearCart();
    Alert.alert('Order Placed! 🎉', 'Your order has been placed successfully.\n\nPurchase event sent to Smartech CE.', [
      { text: 'Continue Shopping', onPress: () => navigation.navigate('Shop') },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemEmoji}>{item.image}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemPrice}>₹{(item.price * item.qty).toLocaleString()}</Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.qty - 1)}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.qty}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.qty + 1)}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 8 }}>
        <Text style={{ color: '#EF4444', fontSize: 18 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={NC_RED} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 60 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({cart.length})</Text>
        {cart.length > 0 && <TouchableOpacity onPress={clearCart}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>}
      </View>

      <FlatList
        data={cart}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₹{cartTotal.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Place Order →</Text>
          </TouchableOpacity>
        </View>
      )}
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
  clearText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  list: { padding: 14, paddingBottom: 40 },
  cartItem: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2,
  },
  itemEmoji: { fontSize: 36 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  itemBrand: { fontSize: 11, color: '#9CA3AF' },
  itemPrice: { fontSize: 15, fontWeight: '800', color: NC_RED, marginTop: 4 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  qtyValue: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', minWidth: 20, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#6C757D', marginBottom: 16 },
  shopBtn: { backgroundColor: NC_RED, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  footer: {
    backgroundColor: '#fff', padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5E5',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#6C757D' },
  totalAmount: { fontSize: 20, fontWeight: '900', color: '#1A1A2E' },
  checkoutBtn: { backgroundColor: NC_RED, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
