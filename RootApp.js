// src/RootApp.js
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { fetchUserWishlist } from "./redux/wishlistSlice";
import AppNavigator from "./navigation/AppNavigator";

// Push Notification Imports
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";
import axios from "axios";

console.log("Constants.easConfig:", Constants.easConfig);
console.log(
  "Constants.projectId (runtime):",
  Constants?.expoConfig?.extra?.eas?.projectId
);

// ✅ Updated Notification Handler (No deprecation warnings)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // iOS foreground banner
    shouldShowList: true,   // iOS Notification Center
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ✅ Push Notification Registration
async function registerForPushNotificationsAsync() {
  let token;
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId;

  console.log("Using Project ID:", projectId);

  if (!projectId) {
    Alert.alert(
      "Configuration Error",
      "EAS Project ID not found in app.json/app.config.js"
    );
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission denied",
        "Failed to get push token for push notification!"
      );
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;
    console.log("Push Notification Token:", token);
  } else {
    Alert.alert(
      "Not a physical device",
      "Must use a physical device for Push Notifications"
    );
  }

  return token;
}

const RootApp = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const navigation = useNavigation();

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (user && user._id) {
      console.log("RootApp: User is logged in. Fetching wishlist...");
      dispatch(fetchUserWishlist());

      // Register Push Notifications
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          console.log("Sending token to backend for user:", user._id);
          axios
            .post("https://www.dialexportmart.com/api/admin/push-token", {
              token: token,
              userId: user._id,
            })
            .then(() =>
              console.log("Push token sent to backend successfully.")
            )
            .catch((err) =>
              console.error("Failed to send push token:", err)
            );
        }
      });
    } else {
      console.log(
        "RootApp: No user logged in. Skipping wishlist fetch and notification registration."
      );
    }

    // Listener for foreground notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received in foreground:", notification);
      });

    // Listener for tapped notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User tapped on notification:", response);
        const { data } = response.notification.request.content;
        if (data && data.screen) {
          navigation.navigate(data.screen);
        }
      });

    // ✅ Cleanup with `.remove()` instead of deprecated removeNotificationSubscription
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [dispatch, user, navigation]);

  return <AppNavigator />;
};

export default RootApp;
