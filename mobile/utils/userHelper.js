import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserId = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    console.log('=== USER HELPER DEBUG ===');
    console.log('Raw userData:', userData);
    
    if (!userData) {
      console.log('No user data found in AsyncStorage');
      return null;
    }

    const user = JSON.parse(userData);
    console.log('Parsed user object:', user);
    console.log('All user keys:', Object.keys(user));
    
    // Try all possible user ID locations
    const userId = user.id || user._id || user.user?._id || user.user?.id;
    console.log('Found user ID:', userId);
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};
export const getUserEmail = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return null;

    const user = JSON.parse(userData);
    
    // Try all possible email locations
    return user.email || user.user?.email;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};