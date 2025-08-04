import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';
import AllCategoriesScreen from '../screens/AllCategoriesScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SubcategoryScreen from '../screens/SubcategoryScreen';
import ProductsScreen from '../screens/ProductsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PricingPlans from '../screens/Package';
import PaymentScreen from '../screens/PaymentScreen';
import CustomerLeads from '../screens/EnquiryMessagesScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SellerProductsScreen from '../screens/SellerProductsScreen';
import WishlistScreen from '../screens/WishlistScreen';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
<Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
<Stack.Screen name="AllCategories" component={AllCategoriesScreen}    options={{ title: 'Browse All Categories' }}/>
<Stack.Screen name="CategoryScreen" component={CategoryScreen} />
 <Stack.Screen
            name="SellerProductsScreen"
            component={SellerProductsScreen}
            options={{ title: "Seller Products" }} // You can dynamically set title in the screen itself
          />
<Stack.Screen name="PricingPlans" component={PricingPlans} />
<Stack.Screen name="PaymentScreen" component={PaymentScreen} />
<Stack.Screen name="EnquiryMessages" component={CustomerLeads} />
<Stack.Screen name="SubcategoryScreen" component={SubcategoryScreen} />
{/* <Stack.Screen name="ProductsScreen" component={ProductsScreen} options={{ title: "" }}/> */}
<Stack.Screen name="ProductsScreen" component={ProductsScreen}  options={{ headerShown: false }} />
{/* <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product Details" }} /> */}
<Stack.Screen name="ProductDetail" component={ProductDetailScreen}  options={{ headerShown: false }} />
<Stack.Screen name="DashboardScreen" component={DashboardScreen}  options={{ headerShown: false }}/>
<Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} /> 
<Stack.Screen name="WishlistScreen" component={WishlistScreen} options={{ title: 'My Wishlist' }}/> 
        </>
      ) : (
        <>
<Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
<Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
