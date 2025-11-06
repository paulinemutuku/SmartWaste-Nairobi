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

// PHOTO STORAGE FUNCTIONS
const PHOTO_STORAGE_KEY = 'smartwaste_local_photos';

// NEW: Save multiple photos for a report
export const saveReportPhotos = async (reportId, imageUris) => {
  try {
    const existingPhotos = await getStoredPhotos();
    const updatedPhotos = { ...existingPhotos };
    
    // Save each photo with index (reportId_0, reportId_1, etc.)
    imageUris.forEach((imageUri, index) => {
      const photoKey = `${reportId}_${index}`;
      updatedPhotos[photoKey] = imageUri;
    });
    
    await AsyncStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(updatedPhotos));
    console.log(`✅ ${imageUris.length} photos saved locally for report:`, reportId);
  } catch (error) {
    console.log('❌ Error saving photos locally:', error);
  }
};

// KEEP: Existing single photo function for backward compatibility
export const saveReportPhoto = async (reportId, imageUri) => {
  try {
    const existingPhotos = await getStoredPhotos();
    const updatedPhotos = {
      ...existingPhotos,
      [reportId]: imageUri
    };
    await AsyncStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(updatedPhotos));
    console.log('✅ Photo saved locally for report:', reportId);
  } catch (error) {
    console.log('❌ Error saving photo locally:', error);
  }
};

export const getStoredPhotos = async () => {
  try {
    const stored = await AsyncStorage.getItem(PHOTO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.log('❌ Error getting stored photos:', error);
    return {};
  }
};

// NEW: Get all photos for a report
export const getPhotosForReport = async (reportId) => {
  const photos = await getStoredPhotos();
  const reportPhotos = [];
  
  // Get all photos for this report (they're stored as reportId_0, reportId_1, etc.)
  Object.keys(photos).forEach(key => {
    if (key.startsWith(reportId + '_')) {
      reportPhotos.push(photos[key]);
    }
  });
  
  // Also check for single photo (backward compatibility)
  if (reportPhotos.length === 0 && photos[reportId]) {
    reportPhotos.push(photos[reportId]);
  }
  
  console.log(`📸 Found ${reportPhotos.length} local photos for report ${reportId}`);
  return reportPhotos;
};

// KEEP: Existing single photo function for backward compatibility
export const getPhotoForReport = async (reportId) => {
  const photos = await getStoredPhotos();
  return photos[reportId] || null;
};