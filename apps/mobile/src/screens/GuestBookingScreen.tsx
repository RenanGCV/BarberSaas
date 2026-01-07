import { theme } from '@/constants/theme';
import { appointmentService } from '@/services/appointment.service';
import { useAppStore } from '@/store/app.store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GuestBookingScreen() {
  const router = useRouter();
  const { selectedTenant, selectedBarber, selectedService, selectedDateTime } = useAppStore();

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhone = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');

    // Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setGuestPhone(formatted);
  };

  const validateForm = () => {
    if (!guestName.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu nome');
      return false;
    }

    if (!guestPhone.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu telefone');
      return false;
    }

    const numbersOnly = guestPhone.replace(/\D/g, '');
    if (numbersOnly.length < 10) {
      Alert.alert('Erro', 'Telefone inválido. Use o formato (XX) XXXXX-XXXX');
      return false;
    }

    if (!selectedBarber || !selectedService || !selectedDateTime) {
      Alert.alert('Erro', 'Informações do agendamento incompletas');
      return false;
    }

    return true;
  };

  const handleConfirmBooking = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await appointmentService.createAsGuest({
        barberId: selectedBarber!.id,
        serviceId: selectedService!.id,
        scheduledAt: selectedDateTime!.toISOString(),
        notes: notes.trim() || undefined,
        guestName: guestName.trim(),
        guestPhone: guestPhone.replace(/\D/g, ''), // Envia só números
      });

      Alert.alert(
        '✅ Agendamento Realizado!',
        `Olá ${guestName}!\n\nSeu agendamento em ${selectedTenant?.name} foi registrado com sucesso.\n\nA barbearia entrará em contato via WhatsApp para confirmar seu horário.\n\nObrigado! 💈`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(public)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível realizar o agendamento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedBarber || !selectedService || !selectedDateTime) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Informações incompletas</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Finalizar Agendamento</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Resumo do Agendamento</Text>

        <View style={styles.infoRow}>
          <Ionicons name="business" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>{selectedTenant?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>Barbeiro: {selectedBarber.user.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cut" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>{selectedService.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            {selectedDateTime.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            {selectedDateTime.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Valor:</Text>
          <Text style={styles.priceValue}>R$ {selectedService.price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Seus Dados</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor={theme.colors.textTertiary}
            value={guestName}
            onChangeText={setGuestName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>WhatsApp *</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            placeholderTextColor={theme.colors.textTertiary}
            value={guestPhone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={15}
          />
          <Text style={styles.helperText}>
            A barbearia entrará em contato para confirmar
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Observações (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Gostaria de um corte degradê..."
            placeholderTextColor={theme.colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
        onPress={handleConfirmBooking}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        * Ao confirmar, você receberá uma mensagem de confirmação via WhatsApp
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  priceValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.md,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginLeft: theme.spacing.sm,
  },
  disclaimer: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
    textAlign: 'center',
  },
});
