import { theme } from '@/constants/theme';
import type { Service } from '@/types';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onPress: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  selected = false,
  onPress,
}) => {
  return (
    <View
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{service.name}</Text>
        {service.description && (
          <Text style={styles.description} numberOfLines={2}>
            {service.description}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.duration}>{service.duration} min</Text>
          <Text style={styles.price}>
            R$ {service.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cardHover,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
});
