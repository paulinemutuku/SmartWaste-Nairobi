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

export default function ReportScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [address, setAddress] = useState('Getting location...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true);

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      setAddress('Locating...');
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress('Location permission denied');
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
        setAddress(fullAddress || 'Location detected');
      } else {
        setAddress('Location detected');
      }
      
    } catch (error) {
      setAddress('Error getting location');
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
    Alert.alert('Permission required', 'Sorry, we need camera roll permissions to select photos.');
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
    Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
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
    Alert.alert('Error', 'Please describe the waste issue');
    return;
  }

  if (address.includes('Error') || address.includes('denied')) {
    Alert.alert('Location Error', 'Please enable location services and refresh');
    return;
  }

  setIsSubmitting(true);
  
  try {
    let locationData = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = locationData.coords;

    const { getUserId } = require('../../utils/userHelper');
    const submittedBy = await getUserId();

    if (!submittedBy) {
      Alert.alert('Login Required', 'Please log in to submit a report');
      setIsSubmitting(false);
      return;
    }

    const userDataString = await AsyncStorage.getItem('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const token = userData?.token;

    const reportData = {
      description: description.trim(),
      location: address,
      latitude: latitude,
      longitude: longitude,
      wasteType: 'general',
      userId: submittedBy
    };

    const response = await fetch('https://smart-waste-nairobi-chi.vercel.app/api/reports/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Server error');
    }

    Alert.alert(
      'Success! 🎉', 
      'Your waste report has been submitted to our system.',
      [
        { 
          text: 'View Status', 
          onPress: () => router.replace('/(tabs)/status')
        },
        {
          text: 'Report Another',
          onPress: () => {
            setDescription('');
            setImages([]);
            setIsSubmitting(false);
          }
        }
      ]
    );

    } catch (error) {
    console.log('Full error object:', error);
    Alert.alert('Submission Failed', 'Could not submit report. Please try again.');
  }
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report Waste Issue</Text>
      
      <View style={styles.locationContainer}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationLabel}>📍 Current Location</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            <Text style={styles.refreshButtonText}>
              {isGettingLocation ? '🔄' : '🔄 Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isGettingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2d5a3c" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : (
          <Text style={styles.addressText}>{address}</Text>
        )}
      </View>

      <Text style={styles.label}>Describe the waste issue *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g., Overflowing bins at market, illegal dumping site, full public bins..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Add Photos *</Text>
      <Text style={styles.photoSubtitle}>At least one photo required</Text>
      
      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>📸 Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>🖼️ Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <View style={styles.imagesContainer}>
          <Text style={styles.imagesCount}>{images.length} photo(s) added</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imagesRow}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => removeImage(index)}
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
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={submitReport}
        disabled={isSubmitting || isGettingLocation || images.length === 0}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>📤 Submit Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
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
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2d5a3c',
    fontSize: 16,
    fontWeight: '600',
  },
});