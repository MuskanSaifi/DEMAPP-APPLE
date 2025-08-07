// src/RootApp.js
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { fetchUserWishlist } from './redux/wishlistSlice'; 
import AppNavigator from './navigation/AppNavigator';

// Push Notification Imports
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import axios from 'axios';

// Set up the notification handler once at the top level
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Async function to register for push notifications and get the token
async function registerForPushNotificationsAsync() {
  let token;
    // Yeh line add karein
  console.log('Constants.easConfig:', Constants.easConfig);
  console.log('Constants.projectId:', Constants.easConfig?.projectId);

  if (Constants.easConfig?.projectId) {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission denied', 'Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.easConfig.projectId })).data;
      console.log('Push Notification Token:', token); 
    } else {
      Alert.alert('Not a physical device', 'Must use a physical device for Push Notifications');
    }
  } else {
    Alert.alert('Configuration Error', 'EAS Project ID not found in app.json/app.config.js');
  }
  return token;
}

const RootApp = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user); 
    const navigation = useNavigation(); // Get the navigation object

    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        if (user && user._id) { 
            console.log("RootApp: User is logged in. Fetching wishlist...");
            dispatch(fetchUserWishlist());

            // --- Push Notification Registration ---
            registerForPushNotificationsAsync().then(token => {
              if (token) {
                console.log("Sending token to backend for user:", user._id);
                // Assuming you have an API endpoint to save the push token
                axios.post('https://www.dialexportmart.com/api/admin/push-token', {
                  token: token,
                  userId: user._id,
                })
                .then(res => console.log('Push token sent to backend successfully.'))
                .catch(err => console.error('Failed to send push token:', err));
              }
            });

        } else {
            console.log("RootApp: No user logged in. Skipping wishlist fetch and notification registration.");
        }

        // --- Push Notification Listeners ---
        // This listener fires when a notification is received while the app is in the foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received in foreground:', notification);
          // Optional: You could dispatch an action to update the UI or show an in-app banner here
        });

        // This listener fires when a user taps on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('User tapped on notification:', response);
          const { data } = response.notification.request.content;
          if (data && data.screen) {
            // Navigate to the screen specified in the notification data
            // The `NotificationsScreen` name must match the one in your navigator
            navigation.navigate(data.screen);
          }
        });

        // Cleanup function to remove listeners
        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current);
          Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [dispatch, user, navigation]);

    return <AppNavigator />;
};
export default RootApp;