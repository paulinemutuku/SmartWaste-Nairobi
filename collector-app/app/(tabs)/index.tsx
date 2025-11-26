import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface AssignedRoute {
  _id: string;
  routeId: string;
  clusterId: string;
  clusterName: string;
  clusterLocation: string;
  gpsCoordinates: [number, number];
  assignedDate: string;
  scheduledDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: string;
  reportCount: number;
  notes: string;
  pickupLocation: string;
  destinationCoordinates: [number, number];
  estimatedTime: string;
  distance: string;
  optimizedRoute?: any;
  pickupCoordinates?: [number, number]; 
  travelTime?: string; 
  collectionTime?: string; 
}

export default function TodayTasksScreen() {
  const [routes, setRoutes] = useState<AssignedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { collector } = useAuth();

  const fetchAssignedRoutes = async () => {
    if (!collector) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch(
        `https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collector._id}/routes`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || []);
      } else {
        console.log('No routes assigned yet');
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Error', 'Failed to load your assigned routes');
      setRoutes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedRoutes();
  }, [collector]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedRoutes();
  };

  const startCollection = async (routeId: string) => {
    if (!collector) {
      Alert.alert('Error', 'Please login again');
      return;
    }

    try {
      const response = await fetch(
        `https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collector._id}/routes/${routeId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'in-progress' }),
        }
      );

      if (response.ok) {
        Alert.alert('Collection Started', 'Route status updated to in-progress');
        fetchAssignedRoutes();
      } else {
        Alert.alert('Error', 'Failed to start collection');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update route status');
    }
  };

  const completeCollection = async (routeId: string) => {
    if (!collector) {
      Alert.alert('Error', 'Please login again');
      return;
    }

    try {
      const response = await fetch(
        `https://smart-waste-nairobi-chi.vercel.app/api/collectors/${collector._id}/routes/${routeId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'completed' }),
        }
      );

      if (response.ok) {
        Alert.alert('Collection Completed!', 'Great job! Route marked as completed.');
        fetchAssignedRoutes();
      } else {
        Alert.alert('Error', 'Failed to complete collection');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update route status');
    }
  };

  // 🧭 Enhanced navigation with better error handling
  const openNavigation = (coordinates: any) => {
    console.log('🔍 Raw coordinates received:', coordinates);
    console.log('🔍 Coordinates type:', typeof coordinates);
    
    if (!coordinates) {
      Alert.alert('Navigation Error', 'No GPS coordinates available for this route');
      return;
    }

    try {
      let lat: number;
      let lng: number;
      
      // Multiple coordinate format support
      if (Array.isArray(coordinates) && coordinates.length >= 2) {
        lat = parseFloat(coordinates[0]);
        lng = parseFloat(coordinates[1]);
      } else if (coordinates.lat !== undefined && coordinates.lng !== undefined) {
        lat = parseFloat(coordinates.lat);
        lng = parseFloat(coordinates.lng);
      } else if (coordinates.latitude !== undefined && coordinates.longitude !== undefined) {
        lat = parseFloat(coordinates.latitude);
        lng = parseFloat(coordinates.longitude);
      } else if (coordinates[0] && coordinates[1]) {
        lat = parseFloat(coordinates[0]);
        lng = parseFloat(coordinates[1]);
      } else {
        Alert.alert('Navigation Error', 'Invalid GPS coordinates format: ' + JSON.stringify(coordinates));
        return;
      }

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert('Navigation Error', `Invalid GPS coordinate values: lat=${lat}, lng=${lng}`);
        return;
      }

      // Check if coordinates are reasonable (within Kenya bounds)
      if (lat < -4.9 || lat > 5.0 || lng < 33.5 || lng > 42.0) {
        Alert.alert('Navigation Warning', 'Coordinates appear to be outside Nairobi area, but opening navigation anyway.');
      }

      console.log('✅ Parsed coordinates for navigation:', { lat, lng });
      
      const url = Platform.select({
        ios: `maps://app?daddr=${lat},${lng}&dirflg=d`,
        android: `google.navigation:q=${lat},${lng}`,
      });

      console.log('🌐 Opening navigation URL:', url);
      
      Linking.openURL(url!).catch((error) => {
        console.log('❌ Navigation app error:', error);
        // Fallback to Google Maps web
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        console.log('🔄 Using fallback URL:', fallbackUrl);
        Linking.openURL(fallbackUrl);
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to open navigation: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

const openOptimizedNavigation = async (route: AssignedRoute) => {
  console.log('🚀 Starting optimized navigation for route:', route.routeId);
  
  if (!collector) {
    Alert.alert('Error', 'Please login again');
    return;
  }

  try {
    const collectionCoords = route.gpsCoordinates || route.destinationCoordinates;
    
    if (!collectionCoords || collectionCoords.length < 2) {
      Alert.alert('Navigation Error', 'No valid coordinates available for this route');
      return;
    }

    const [lat, lng] = collectionCoords;

    // 🗺️ USE GOOGLE MAPS WITH PROPER DIRECTIONS
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
    
    console.log('🌐 Opening Google Maps with directions:', googleMapsUrl);
    
    // Try to open in Google Maps app first
    const googleMapsAppUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
    
    Linking.openURL(googleMapsAppUrl).catch(() => {
      // If Google Maps app not installed, use browser
      Linking.openURL(googleMapsUrl).catch((error) => {
        console.log('❌ Navigation error:', error);
        Alert.alert('Navigation Error', 'Please install Google Maps for turn-by-turn directions');
      });
    });

  } catch (error) {
    console.error('❌ Navigation error:', error);
    Alert.alert('Navigation Error', 'Failed to start navigation');
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      default: return 'calendar';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="trash" size={64} color="#059669" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  if (!collector) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="warning" size={64} color="#EF4444" />
        <Text style={styles.loadingText}>Please login to view your tasks</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Today's Collection Routes</Text>
        <Text style={styles.subtitle}>
          {routes.length} routes assigned • {routes.filter(r => r.status === 'completed').length} completed
        </Text>
        <Text style={styles.collectorName}>Welcome, {collector.name}!</Text>
        <Text style={styles.collectorZone}>Zone: {collector.zone || 'Nairobi'}</Text>
      </View>

      {routes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle" size={80} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No routes assigned</Text>
          <Text style={styles.emptyStateText}>
            Check back later for new collection assignments from the scheduling team.
          </Text>
        </View>
      ) : (
        routes.map((route) => (
          <View key={route._id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.clusterName}</Text>
                <View style={styles.statusContainer}>
                  <Ionicons 
                    name={getStatusIcon(route.status)} 
                    size={16} 
                    color={getStatusColor(route.status)} 
                  />
                  <Text 
                    style={[
                      styles.statusText, 
                      { color: getStatusColor(route.status) }
                    ]}
                  >
                    {route.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.routeDate}>
                {formatDate(route.scheduledDate)}
              </Text>
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{route.clusterLocation}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="document" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{route.reportCount} reports</Text>
              </View>
              {route.distance && (
                <View style={styles.detailItem}>
                  <Ionicons name="analytics" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{route.distance}</Text>
                </View>
              )}
            </View>

            {/* 🗺️ OPTIMIZED NAVIGATION SECTION */}
            <View style={styles.navigationSection}>
              <Text style={styles.navigationTitle}>📍 Optimized Collection Route</Text>
              
              {/* Route optimization details */}
              <View style={styles.optimizationDetails}>
                <View style={styles.optimizationItem}>
                  <Ionicons name="business" size={14} color="#059669" />
                  <Text style={styles.optimizationText}>
                    Start: {route.pickupLocation || 'Nairobi Depot'}
                  </Text>
                </View>
                <View style={styles.optimizationItem}>
                  <Ionicons name="navigate" size={14} color="#059669" />
                  <Text style={styles.optimizationText}>
                    Distance: {route.distance || 'Calculating...'}
                  </Text>
                </View>
                <View style={styles.optimizationItem}>
                  <Ionicons name="time" size={14} color="#059669" />
                  <Text style={styles.optimizationText}>
                    Time: {route.estimatedTime || 'Calculating...'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.navigationButton}
                onPress={() => openOptimizedNavigation(route)}
              >
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.navigationButtonText}>Start Optimized Navigation</Text>
              </TouchableOpacity>
              
              <Text style={styles.navigationHint}>
                🚗 Route: Depot → Collection → Return to Depot
              </Text>
            </View>

            {route.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Collection Notes:</Text>
                <Text style={styles.notesText}>{route.notes}</Text>
              </View>
            )}

            {/* Action Buttons */}
            {route.status === 'scheduled' && (
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => startCollection(route._id)}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Collection</Text>
              </TouchableOpacity>
            )}

            {route.status === 'in-progress' && (
              <TouchableOpacity 
                style={styles.inProgressButton}
                onPress={() => completeCollection(route._id)}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.inProgressButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}

            {route.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-done" size={16} color="#059669" />
                <Text style={styles.completedText}>
                  Completed • {route.completedAt ? formatDate(route.completedAt) : 'Today'}
                </Text>
              </View>
            )}
          </View>
        ))
      )}

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          • Tap "Start Optimized Navigation" for GPS directions{'\n'}
          • Start collection when you arrive at site{'\n'}
          • Mark complete when collection is done{'\n'}
          • Pull down to refresh for new assignments
        </Text>
      </View>

      {/* Performance Stats */}
      {routes.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {routes.filter(r => r.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {routes.filter(r => r.status === 'in-progress').length}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {routes.reduce((sum, route) => sum + route.reportCount, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  collectorName: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    marginTop: 8,
  },
  collectorZone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    margin: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  routeDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  routeDetails: {
    flexDirection: 'column',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  navigationSection: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  navigationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  optimizationDetails: {
    marginBottom: 12,
  },
  optimizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optimizationText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 6,
    fontWeight: '500',
  },
  navigationButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  navigationHint: {
    fontSize: 11,
    color: '#059669',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notesContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inProgressButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  inProgressButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});