import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import SmartechBaseReact from 'smartech-base-react-native';
import SmartechPushReact from 'smartech-push-react-native';
import SmartechAppInboxReact from 'smartech-appinbox-react-native';
import { HanselTrackerRn } from 'smartech-reactnative-nudges';

import { ShopProvider } from './store/ShopContext';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import CEDashboardScreen from './screens/CEDashboardScreen';
import PXDashboardScreen from './screens/PXDashboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomInboxScreen from './screens/CustomInboxScreen';
import UpdateProfileScreen from './screens/UpdateProfileScreen';
import EventsScreen from './screens/EventsScreen';
import AppPZScreen from './screens/AppPZScreen';
import ShopScreen from './screens/ShopScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import WishlistScreen from './screens/WishlistScreen';
import DeviceInfoScreen from './screens/DeviceInfoScreen';

export const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ── Deeplink router ──────────────────────────────── */
function routeDeeplink(url) {
  if (!url) return;
  const lower = url.toLowerCase();

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    Linking.openURL(url).catch(err => console.warn('Cannot open URL:', err));
    return;
  }

  if (!navigationRef.isReady()) { setTimeout(() => routeDeeplink(url), 500); return; }

  if (lower.includes('profile'))       navigationRef.navigate('Profile');
  else if (lower.includes('event'))    navigationRef.navigate('Events');
  else if (lower.includes('inbox'))    navigationRef.navigate('CustomInbox');
  else if (lower.includes('shop'))     navigationRef.navigate('Shop');
  else if (lower.includes('cart'))     navigationRef.navigate('Cart');
  else if (lower.includes('wishlist')) navigationRef.navigate('Wishlist');
  else if (lower.includes('cedash'))   navigationRef.navigate('CEDashboard');
  else if (lower.includes('pxdash'))   navigationRef.navigate('PXDashboard');
  else if (lower.includes('apppz'))    navigationRef.navigate('AppPZ');
  else if (lower.includes('settings')) navigationRef.navigate('Settings');
  else if (lower.includes('device'))   navigationRef.navigate('DeviceInfo');
  else                                 navigationRef.navigate('Main');
}

/* ── Bottom Tabs ──────────────────────────────────── */
function HomeTabs() {
  const [inboxCount, setInboxCount] = useState(0);

  const refreshInboxCount = useCallback(() => {
    SmartechAppInboxReact.getAppInboxMessageCount(3, (err, count) => {
      if (!err && typeof count === 'number') setInboxCount(count);
    });
  }, []);

  useEffect(() => {
    refreshInboxCount();
    const interval = setInterval(refreshInboxCount, 15000);
    return () => clearInterval(interval);
  }, [refreshInboxCount]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E11D48',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#E5E5E5', backgroundColor: '#fff', elevation: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Inbox') {
            return (
              <View style={{ position: 'relative' }}>
                <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
                {inboxCount > 0 && (
                  <View style={tabStyles.badge}>
                    <Text style={tabStyles.badgeText}>{inboxCount > 99 ? '99+' : inboxCount}</Text>
                  </View>
                )}
              </View>
            );
          }
          const icons = {
            Home:    ['home', 'home-outline'],
            Events:  ['flash', 'flash-outline'],
            PX:      ['layers', 'layers-outline'],
            Profile: ['person-circle', 'person-circle-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen
        name="Inbox"
        component={CustomInboxScreen}
        listeners={{ focus: refreshInboxCount }}
      />
      <Tab.Screen name="Events"  component={EventsScreen} />
      <Tab.Screen name="PX"      component={PXDashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: '#E11D48', borderRadius: 9,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
});

/* ── Root Stack ───────────────────────────────────── */
function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={HomeTabs} />
      <Stack.Screen name="CEDashboard" component={CEDashboardScreen} />
      <Stack.Screen name="PXDashboard" component={PXDashboardScreen} />
      <Stack.Screen name="AppPZ" component={AppPZScreen} />
      <Stack.Screen name="CustomInbox" component={CustomInboxScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="DeviceInfo" component={DeviceInfoScreen} />
    </Stack.Navigator>
  );
}

/* ── App ──────────────────────────────────────────── */
export default function App() {

  // Smartech CE deeplink — push, in-app, app inbox
  useEffect(() => {
    const handleDeeplinkWithPayload = (smartechData) => {
      console.log('Smartech Data :: ', smartechData);
      console.log('Smartech Deeplink :: ', smartechData.smtDeeplink);
      console.log('Smartech CustomPayload :: ', smartechData.smtCustomPayload);
      routeDeeplink(smartechData?.smtDeeplink ?? '');
    };
    SmartechBaseReact.addListener(SmartechBaseReact.SmartechDeeplink, handleDeeplinkWithPayload);
    return () => SmartechBaseReact.removeListener(SmartechBaseReact.SmartechDeeplink);
  }, []);

  // PX / Hansel nudge deeplinks
  useEffect(() => {
    HanselTrackerRn.registerHanselDeeplinkListener();
    HanselTrackerRn.addListener('HanselDeeplinkEvent', (data) => {
      console.log('PX Nudge Deeplink ::', data?.url);
      routeDeeplink(data?.url ?? '');
    });
    return () => {
      HanselTrackerRn.removeListener('HanselDeeplinkEvent');
      HanselTrackerRn.deRegisterListener();
    };
  }, []);

  // OS Linking — background
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => routeDeeplink(url));
    return () => sub.remove();
  }, []);

  // OS Linking — cold start
  useEffect(() => {
    Linking.getInitialURL().then(url => { if (url) routeDeeplink(url); }).catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ShopProvider>
          <NavigationContainer ref={navigationRef}>
            <RootStack />
          </NavigationContainer>
        </ShopProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
