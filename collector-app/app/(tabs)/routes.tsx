import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

interface RouteHistory {
  _id: string;
  routeId: string;
  clusterName: string;
  clusterLocation: string;
  scheduledDate: string;
  completedAt: string;
  reportCount: number;
  status: string;
  gpsCoordinates: [number, number];
  distance: string;
  estimatedTime: string;
}

export default function RouteHistoryScreen() {
  const [routes, setRoutes] = useState<RouteHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { collector } = useAuth();

  const fetchRouteHistory = async () => {
    if (!collector) return;

    try {
      // Get all routes and filter completed ones
      const assignedRoutes = (collector as any)?.assignedRoutes || [];
      const completedRoutes = assignedRoutes
        .filter((route: any) => route.status === 'completed')
        .map((route: any) => ({
          _id: route._id,
          routeId: route.routeId,
          clusterName: route.clusterName,
          clusterLocation: route.clusterLocation,
          scheduledDate: route.scheduledDate,
          completedAt: route.completedAt,
          reportCount: route.reportCount,
          status: route.status,
          gpsCoordinates: route.gpsCoordinates,
          distance: route.distance,
          estimatedTime: route.estimatedTime,
        }));

      setRoutes(completedRoutes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load route history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRouteHistory();
  }, [collector]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRouteHistory();
  };

  const openMap = (coordinates: [number, number]) => {
    if (!coordinates || coordinates.length < 2) {
      Alert.alert('Error', 'No coordinates available');
      return;
    }

    const [lat, lng] = coordinates;
    const url = Platform.select({
      ios: `maps://?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
    });

    Linking.openURL(url!).catch(() => {
      const webUrl = `https://www.google.com/maps/@${lat},${lng},15z`;
      Linking.openURL(webUrl);
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="time" size={64} color="#059669" />
        <Text style={styles.loadingText}>Loading your route history...</Text>
      </View>
    );
  }

  if (!collector) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="warning" size={64} color="#EF4444" />
        <Text style={styles.loadingText}>Please login to view route history</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Route History</Text>
        <Text style={styles.subtitle}>
          {routes.length} completed collection{routes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {routes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle" size={80} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No completed routes yet</Text>
          <Text style={styles.emptyStateText}>
            Your completed collection routes will appear here. Finish your first route to see it in history!
          </Text>
        </View>
      ) : (
        routes.map((route, index) => (
          <View key={route._id || index} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.clusterName}</Text>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.statusText}>COMPLETED</Text>
                </View>
              </View>
              <Text style={styles.routeDate}>
                {formatDate(route.completedAt || route.scheduledDate)}
              </Text>
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{route.clusterLocation}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="document" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{route.reportCount} reports collected</Text>
              </View>
              {route.distance && (
                <View style={styles.detailItem}>
                  <Ionicons name="navigate" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{route.distance}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => openMap(route.gpsCoordinates)}
              >
                <Ionicons name="map" size={18} color="#3B82F6" />
                <Text style={styles.mapButtonText}>View on Map</Text>
              </TouchableOpacity>
              
              <View style={styles.statsChip}>
                <Ionicons name="time" size={14} color="#6B7280" />
                <Text style={styles.statsText}>{route.estimatedTime}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      {routes.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Collection Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{routes.length}</Text>
              <Text style={styles.summaryLabel}>Total Routes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {routes.reduce((sum, route) => sum + route.reportCount, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Reports Handled</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {Math.round(routes.reduce((sum, route) => {
                  const distance = parseFloat(route.distance) || 0;
                  return sum + distance;
                }, 0) * 10) / 10}
              </Text>
              <Text style={styles.summaryLabel}>Total KM</Text>
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
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
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
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});