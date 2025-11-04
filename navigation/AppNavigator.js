import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { BuyerAuthContext } from '../context/BuyerAuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';
import AllCategoriesScreen from '../screens/AllCategoriesScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SubcategoryScreen from '../screens/SubcategoryScreen';
import ProductsScreen from '../screens/ProductsScreen';

import DashboardScreen from '../screens/DashboardScreen';
import BuyerDashboardScreen from '../screens/BuyerDashboardScreen';

import PricingPlans from '../screens/Package';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SellerProductsScreen from '../screens/SellerProductsScreen';
import WishlistScreen from '../screens/WishlistScreen';
import Notifications from '../screens/NotificationsScreen'; 
import TermsScreen from '../screens/TermsScreen';
import BuyerRegisterScreen from '../screens/BuyerRegisterScreen';
import BuyerLoginScreen from '../screens/BuyerLoginScreen';
import BuySell from '../screens/BuySell';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);
  const { buyer, isLoading: buyerLoading } = useContext(BuyerAuthContext);

if (isLoading || buyerLoading) {
  return <SplashScreen />;
}
return (
  <Stack.Navigator>
    {/* Always accessible screens */}
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AllCategories"
      component={AllCategoriesScreen}
      options={{ title: "Browse All Categories", headerTintColor: "#000" }}
    />
    <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
    <Stack.Screen name="PricingPlans" component={PricingPlans} options={{ headerShown: false }}/>
    <Stack.Screen name="BuySell" component={BuySell}  options={{ headerShown: false }}/>
    <Stack.Screen name="TermsScreen" component={TermsScreen} />
    <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
    <Stack.Screen name="SubcategoryScreen" component={SubcategoryScreen} />
    <Stack.Screen
      name="SellerProductsScreen"
      component={SellerProductsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProductsScreen"
      component={ProductsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PaymentSuccessScreen"
      component={PaymentSuccessScreen}
    />
    <Stack.Screen
      name="NotificationsScreen"
      component={Notifications}
      options={{ title: "All Notifications", headerTintColor: "#000" }}
    />
    <Stack.Screen
      name="WishlistScreen"
      component={WishlistScreen}
      options={{ title: "My Wishlist", headerTintColor: "#000" }}
    />
    {/*User Login/Register screens */}
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    {/*Buyer Login/Register screens */}
    <Stack.Screen
      name="BuyerRegisterScreen"
      component={BuyerRegisterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="BuyerLoginScreen"
      component={BuyerLoginScreen}
      options={{ headerShown: false }}
    />
   {/* User Dashboard */}
    {user && (
      <Stack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
    )}
    {/* Buyer Dashboard */}
<Stack.Screen
  name="BuyerDashboardScreen"
  component={BuyerDashboardScreen}
  options={{ headerShown: false }}
/>
  </Stack.Navigator>
);
}
