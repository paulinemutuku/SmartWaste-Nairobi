import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ReportScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [address, setAddress] = useState(t('gettingLocation'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true);

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      setAddress(t('locating'));
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress(t('locationDenied'));
        setIsGettingLocation(false);
        return;
      }

      let locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = locationData.coords;
      
      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        const fullAddress = `${addr.name || ''} ${addr.street || ''}, ${addr.city || 'Nairobi'}, ${addr.region || 'Kenya'}`.trim();
        setAddress(fullAddress || t('locationDetected'));
      } else {
        setAddress(t('locationDetected'));
      }
      
    } catch (error) {
      setAddress(t('locationError'));
    } finally {
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionRequired'), t('cameraRollPermission'));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionRequired'), t('cameraPermission'));
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

const submitReport = async () => {
  if (!description.trim()) {
    Alert.alert(t('missingInfo'), t('describeIssue'));
    return;
  }

  if (images.length === 0) {
    Alert.alert(t('photoRequired'), t('photoRequiredDesc'));
    return;
  }

  setIsSubmitting(true);
  
  try {
    let locationData = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = locationData.coords;

    const { getUserId, saveReportPhoto } = require('../../utils/userHelper');
    const submittedBy = await getUserId();

    if (!submittedBy) {
      Alert.alert(t('loginRequired'), t('loginRequiredDesc'));
      setIsSubmitting(false);
      return;
    }

    let uploadedPhotoUrls = [];
    
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        try {
          const imageUri = images[i];
          
          const formData = new FormData();
          formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `photo_${i}.jpg`,
          } as any);
          formData.append('upload_preset', 'smartwaste');
          
          const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dbjhcfq0b/image/upload', {
            method: 'POST',
            body: formData,
          });
          
          const cloudinaryData = await cloudinaryResponse.json();
          
          if (cloudinaryData.secure_url) {
            uploadedPhotoUrls.push(cloudinaryData.secure_url);
          }
        } catch (uploadError) {
          console.log('Photo upload error:', uploadError);
        }
      }
    }

    const primaryPhotoUrl = uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls[0] : 'https://placehold.co/300x200/2d5a3c/ffffff/png?text=Waste+Photo';

    const reportData = {
      description: description.trim(),
      location: address,
      latitude: latitude,
      longitude: longitude,
      wasteType: 'general',
      userId: submittedBy,
      photo: primaryPhotoUrl,
      photos: uploadedPhotoUrls,
      priority: 'pending'
    };

    const response = await fetch('https://smart-waste-nairobi-chi.vercel.app/api/reports/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || t('submitFailed'));
    }

    if (images.length > 0) {
      const { saveReportPhoto } = require('../../utils/userHelper');
      for (let i = 0; i < images.length; i++) {
        await saveReportPhoto(`${result.report._id}_${i}`, images[i]);
      }
    }

    const localReport = {
      id: result.report._id,
      description: description.trim(),
      images: images,
      photoUrls: uploadedPhotoUrls,
      address: address,
      location: address,
      timestamp: new Date().toISOString(),
      status: 'Submitted',
      priority: 'pending'
    };

    Alert.alert(
      t('reportSubmitted'), 
      t('reportSubmittedDesc', uploadedPhotoUrls.length),
      [
        {
          text: t('viewMyReports'),
          onPress: () => router.push({
            pathname: '/(tabs)/status',
            params: { newReport: JSON.stringify(localReport) }
          })
        },
        {
          text: t('submitAnother'),
          onPress: () => {
            setDescription('');
            setImages([]);
            getCurrentLocation();
          }
        }
      ]
    );
    
  } catch (error: any) {
    Alert.alert(t('submissionFailed'), error.message || t('tryAgainLater'));
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('reportWasteIssue')}</Text>
      
      <View style={styles.locationContainer}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationLabel}>{t('currentLocation')}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            <Text style={styles.refreshButtonText}>
              {isGettingLocation ? '🔄' : `🔄 ${t('refresh')}`}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isGettingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2d5a3c" />
            <Text style={styles.loadingText}>{t('gettingLocation')}</Text>
          </View>
        ) : (
          <Text style={styles.addressText}>{address}</Text>
        )}
      </View>

      <Text style={styles.label}>{t('describeIssueLabel')}</Text>
      <TextInput
        style={styles.textInput}
        placeholder={t('describePlaceholder')}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>{t('addPhotosLabel')}</Text>
      <Text style={styles.photoSubtitle}>{t('photoRequiredSubtitle')}</Text>
      
      <View style={styles.photoButtons}>
        <TouchableOpacity 
          style={[styles.photoButton, isSubmitting && styles.buttonDisabled]} 
          onPress={takePhoto}
          disabled={isSubmitting}
        >
          <Text style={styles.photoButtonText}>{t('takePhoto')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.photoButton, isSubmitting && styles.buttonDisabled]} 
          onPress={pickImage}
          disabled={isSubmitting}
        >
          <Text style={styles.photoButtonText}>{t('chooseFromGallery')}</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <View style={styles.imagesContainer}>
          <Text style={styles.imagesCount}>{t('photosAdded', images.length)}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imagesRow}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => removeImage(index)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.removeImageText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (isSubmitting || isGettingLocation || images.length === 0) && styles.submitButtonDisabled
        ]}
        onPress={submitReport}
        disabled={isSubmitting || isGettingLocation || images.length === 0}
      >
        {isSubmitting ? (
          <View style={styles.submittingContainer}>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.submittingText}>{t('submittingReport')}</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>{t('submitReport')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.backButton, isSubmitting && styles.buttonDisabled]}
        onPress={() => router.back()}
        disabled={isSubmitting}
      >
        <Text style={styles.backButtonText}>{t('backToHome')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2d5a3c',
  },
  locationContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5a3c',
  },
  refreshButton: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d5a3c',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5a3c',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  photoSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: '#4a7c59',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  photoButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  imagesContainer: {
    marginBottom: 20,
  },
  imagesCount: {
    fontSize: 14,
    color: '#2d5a3c',
    fontWeight: '600',
    marginBottom: 10,
  },
  imagesRow: {
    flexDirection: 'row',
  },
  imageItem: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 3,
  },
  removeImageText: {
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#2d5a3c',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submittingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2d5a3c',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});