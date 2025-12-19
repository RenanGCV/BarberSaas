import { theme } from '@/constants/theme';
import type { Tenant } from '@/types';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface BarbershopCardProps {
  barbershop: Tenant;
  onPress: () => void;
}

export const BarbershopCard: React.FC<BarbershopCardProps> = ({
  barbershop,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={
          barbershop.logo
            ? { uri: barbershop.logo }
            : require('../../assets/placeholder.png')
        }
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {barbershop.name}
        </Text>
        {barbershop.address && (
          <Text style={styles.address} numberOfLines={1}>
            {barbershop.address}
          </Text>
        )}
        {barbershop.phone && (
          <Text style={styles.phone}>{barbershop.phone}</Text>
        )}
      </View>
      {barbershop.isActive && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Aberto</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.cardHover,
  },
  content: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  address: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  phone: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
