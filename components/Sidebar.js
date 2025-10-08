import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext'; 
import axios from 'axios';

const Sidebar = ({ activeScreen, toggleSidebar, navigation }) => {
  const { logout, token } = useContext(AuthContext);
  const [expanded, setExpanded] = useState('');
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleExpand = (section) => {
    setExpanded((prev) => (prev === section ? '' : section));
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        "https://www.dialexportmart.com/api/userprofile/profile/userprofile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetail(res.data.user);
    } catch (err) {
      console.error("Error fetching user data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <ScrollView style={styles.sidebar}>
        
        {/* If not logged in */}
        {!token ? (
          <>
            <Text style={styles.welcome}>👋 Welcome Guest</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleSidebar();
                navigation.navigate('Login');
              }}
            >
              <Icon name="login" size={20} color="#666" />
              <Text style={styles.label}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleSidebar();
                navigation.navigate('Register');
              }}
            >
              <Icon name="account-plus" size={20} color="#666" />
              <Text style={styles.label}>Register</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Logged-in header */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                activeScreen === 'Dashboard' ? styles.activeItem : null,
              ]}
              onPress={() => {
                toggleSidebar();
                navigation.navigate('DashboardScreen', { selectedTab: 'Dashboard' });
              }}
            >
              {userDetail?.icon ? (
                <Image source={{ uri: userDetail.icon }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Text style={styles.avatarText}>
                    {userDetail?.fullname?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
              <View style={styles.textContainer}>
                <Text style={styles.greetingText}>👋 Welcome!</Text>
                <Text style={styles.nameText}>{userDetail?.fullname || 'User'}</Text>
              </View>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => toggleExpand('profile')}
            >
              <Icon name="account-circle" size={20} color="#666" />
              <Text style={styles.label}>Profile</Text>
              <Text style={styles.arrow}>{expanded === 'profile' ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expanded === 'profile' && (
              <View style={styles.subMenu}>
                {['User Profile', 'Business Profile', 'Bank Details'].map((sub, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.subItem,
                      activeScreen === sub ? styles.activeSubItem : null,
                    ]}
                    onPress={() => {
                      toggleSidebar();
                      navigation.navigate('DashboardScreen', { selectedTab: sub });
                    }}
                  >
                    <Text
                      style={[
                        styles.subLabel,
                        activeScreen === sub ? styles.activeSubLabel : null,
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Manage Products */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => toggleExpand('products')}
            >
              <Icon name="package-variant" size={20} color="#666" />
              <Text style={styles.label}>Manage Products</Text>
              <Text style={styles.arrow}>{expanded === 'products' ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded === 'products' && (
              <View style={styles.subMenu}>
                {['Add Product', 'My Products'].map((sub, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.subItem,
                      activeScreen === sub ? styles.activeSubItem : null,
                    ]}
                    onPress={() => {
                      toggleSidebar();
                      navigation.navigate('DashboardScreen', { selectedTab: sub });
                    }}
                  >
                    <Text
                      style={[
                        styles.subLabel,
                        activeScreen === sub ? styles.activeSubLabel : null,
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Leads */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => toggleExpand('leads')}
            >
              <Icon name="account-question" size={20} color="#666" />
              <Text style={styles.label}>Leads & Enquiry</Text>
              <Text style={styles.arrow}>{expanded === 'leads' ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded === 'leads' && (
              <View style={styles.subMenu}>
                {['Customer Leads'].map((sub, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.subItem,
                      activeScreen === sub ? styles.activeSubItem : null,
                    ]}
                    onPress={() => {
                      toggleSidebar();
                      navigation.navigate('DashboardScreen', { selectedTab: sub });
                    }}
                  >
                    <Text
                      style={[
                        styles.subLabel,
                        activeScreen === sub ? styles.activeSubLabel : null,
                      ]}
                    >
                      {sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Payments */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                activeScreen === 'Payments' ? styles.activeItem : null,
              ]}
              onPress={() => {
                toggleSidebar();
                navigation.navigate('DashboardScreen', { selectedTab: 'Payments' });
              }}
            >
              <Icon name="credit-card" size={20} color="#666" />
              <Text style={styles.label}>Payments</Text>
            </TouchableOpacity>

            {/* Support Person */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleSidebar();
                navigation.navigate('DashboardScreen', { selectedTab: 'Support Person' });
              }}
            >
              <Icon name="account-supervisor" size={20} color="#666" />
              <Text style={styles.label}>Support Person</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: async () => {
                        await logout();
                        toggleSidebar();
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Login' }],
                        });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Icon name="logout" size={20} color="#666" />
              <Text style={styles.label}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.backdrop} onPress={toggleSidebar} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  padding: 14,
  backgroundColor: "#F1F5F9",
  borderRadius: 10,
  marginVertical: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
},

profileImage: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginRight: 12,
  borderWidth: 1,
  borderColor: "#E2E8F0",
},

placeholderAvatar: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#CBD5E1",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

avatarText: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#1E293B",
},

textContainer: {
  flexDirection: "column",
},

greetingText: {
  fontSize: 12,
  color: "#64748B",
  marginBottom: 2,
},

nameText: {
  fontSize: 14,
  fontWeight: "700",
  color: "#1F2937",
},
  overlay: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 999,
  },
  sidebar: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 60,
    paddingHorizontal: 15,
    width: 390,
    height: '100%',
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeItem: {
    backgroundColor: '#f0f0ff',
    borderColor: '#6A5ACD',
    borderWidth: 1,
  },
  label: {
    color: '#333',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  subMenu: {
    paddingLeft: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  subItem: {
    paddingVertical: 10,
    paddingLeft: 20,
    borderLeftWidth: 2,
    borderColor: '#ddd',
  },
  subLabel: {
    color: '#555',
    fontSize: 15,
  },
  activeSubLabel: {
    color: '#6A5ACD',
    fontWeight: 'bold',
  },
  arrow: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
  welcome: {
    color: '#444',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
export default Sidebar;
