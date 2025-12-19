import { BarbershopCard } from '@/components';
import { theme } from '@/constants/theme';
import { tenantService } from '@/services/tenant.service';
import { useAppStore } from '@/store/app.store';
import type { Tenant } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { setSelectedTenant } = useAppStore();
  const [barbershops, setBarbershops] = useState<Tenant[]>([]);
  const [filteredBarbershops, setFilteredBarbershops] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBarbershops();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBarbershops(barbershops);
    } else {
      const filtered = barbershops.filter((shop) =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBarbershops(filtered);
    }
  }, [searchQuery, barbershops]);

  const loadBarbershops = async () => {
    try {
      const data = await tenantService.getAll();
      setBarbershops(data);
      setFilteredBarbershops(data);
    } catch (error) {
      console.error('Error loading barbershops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBarbershop = (barbershop: Tenant) => {
    setSelectedTenant(barbershop);
    router.push(`/barbershop/${barbershop.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Encontre sua Barbearia</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar barbearia..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredBarbershops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BarbershopCard
            barbershop={item}
            onPress={() => handleSelectBarbershop(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhuma barbearia encontrada
            </Text>
          </View>
        }
      />
    </View>
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
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  list: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
