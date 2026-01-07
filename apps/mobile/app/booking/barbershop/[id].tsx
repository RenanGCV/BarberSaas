import { theme } from '@/constants/theme';
import { barberService } from '@/services/barber.service';
import { serviceService } from '@/services/service.service';
import { useAppStore } from '@/store/app.store';
import type { Barber, Service } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function BarbershopDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { selectedTenant, setSelectedBarber, setSelectedService } = useAppStore();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [barbersData, servicesData] = await Promise.all([
        barberService.getByTenant(id as string),
        serviceService.getByTenant(id as string),
      ]);
      setBarbers(barbersData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    router.push('/booking/select-barber');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.shopInfo}>
        {selectedTenant?.logo && (
          <Image source={{ uri: selectedTenant.logo }} style={styles.logo} />
        )}
        <Text style={styles.shopName}>{selectedTenant?.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            {selectedTenant?.address}, {selectedTenant?.city}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            {selectedTenant?.openTime} - {selectedTenant?.closeTime}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✂️ Serviços</Text>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.card}
            onPress={() => handleSelectService(service)}
          >
            <View style={styles.cardContent}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                {service.description && (
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                )}
                <Text style={styles.serviceDuration}>⏱ {service.duration} min</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>R$ {service.price.toFixed(2)}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍💼 Barbeiros</Text>
        {barbers.map((barber) => (
          <View key={barber.id} style={styles.card}>
            <View style={styles.barberContent}>
              {barber.user.avatar && (
                <Image source={{ uri: barber.user.avatar }} style={styles.avatar} />
              )}
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{barber.user.name}</Text>
                {barber.specialties && barber.specialties.length > 0 && (
                  <Text style={styles.specialties}>
                    {barber.specialties.join(', ')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
  },
  shopName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  serviceDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  serviceDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  barberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  specialties: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
