import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { KINJO_COLORS, RECEIPT_OPTIONS, ReceiptMethod } from '@/lib/kinjo-data';
import { formatCurrency, formatPaymentMethod, formatServiceMode, useOrderStore } from '@/lib/order-store';

export default function ReceiptScreen() {
  const router = useRouter();
  const { receiptMethod, receiptContact, lastOrder, applyReceipt, startNewOrder } = useOrderStore();
  const [selectedMethod, setSelectedMethod] = useState<ReceiptMethod>(receiptMethod);
  const [contact, setContact] = useState(receiptContact);

  useEffect(() => { if (!lastOrder) router.replace('/'); }, [lastOrder, router]);

  const needsContact = useMemo(() => selectedMethod === 'email' || selectedMethod === 'sms', [selectedMethod]);

  if (!lastOrder) return null;

  const finishOrder = () => {
    if (needsContact && contact.trim().length === 0) return;
    applyReceipt(selectedMethod, contact);
    startNewOrder();
    router.replace('/');
  };

  const createdDate = new Date(lastOrder.createdAtIso);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Voltar</Text>
            </Pressable>
            <Text style={styles.step}>ETAPA 5 DE 5</Text>
            <View style={styles.successBadge}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.title}>Pagamento Aprovado!</Text>
            <Text style={styles.subtitle}>Pedido {lastOrder.id} já está sendo preparado na cozinha.</Text>
          </View>

          <View style={styles.orderSummaryCard}>
            <Text style={styles.sectionTitle}>Detalhes do Pedido</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Modo</Text><Text style={styles.detailValue}>{formatServiceMode(lastOrder.serviceMode)}</Text></View>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Pagamento</Text><Text style={styles.detailValue}>{formatPaymentMethod(lastOrder.paymentMethod)}</Text></View>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Itens</Text><Text style={styles.detailValue}>{lastOrder.items.reduce((t, i) => t + i.quantity, 0)}</Text></View>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Horário</Text><Text style={styles.detailValue}>{createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></View>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Pago</Text>
              <Text style={styles.totalValue}>{formatCurrency(lastOrder.total)}</Text>
            </View>
          </View>

          <View style={styles.receiptCard}>
            <Text style={styles.sectionTitle}>Comprovante</Text>
            {RECEIPT_OPTIONS.map((option) => {
              const active = option.id === selectedMethod;
              return (
                <Pressable key={option.id} onPress={() => setSelectedMethod(option.id)}
                  style={[styles.optionRow, active && styles.optionRowActive]}>
                  <View style={[styles.optionRadio, active && styles.optionRadioActive]}>
                    {active && <View style={styles.optionRadioDot} />}
                  </View>
                  <View style={styles.optionTexts}>
                    <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{option.label}</Text>
                    <Text style={styles.optionSubtitle}>{option.helper}</Text>
                  </View>
                </Pressable>
              );
            })}
            {needsContact && (
              <View style={styles.contactWrap}>
                <Text style={styles.contactLabel}>{selectedMethod === 'email' ? 'Endereço de E-mail' : 'Número de Celular'}</Text>
                <TextInput autoCapitalize="none" keyboardType={selectedMethod === 'email' ? 'email-address' : 'phone-pad'}
                  placeholder={selectedMethod === 'email' ? 'seu@email.com' : '(61) 9 9999-9999'}
                  value={contact} onChangeText={setContact} style={styles.contactInput} placeholderTextColor={KINJO_COLORS.mutedText} />
                <Text style={styles.contactHint}>Obrigatório para envio do comprovante.</Text>
              </View>
            )}
          </View>

          <Pressable onPress={finishOrder}
            style={[styles.finishButton, needsContact && contact.trim().length === 0 && styles.finishDisabled]}>
            <Text style={styles.finishButtonText}>Finalizar Pedido ✓</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: KINJO_COLORS.background },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 24, gap: 16 },
  header: { gap: 8 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, alignSelf: 'flex-start' },
  backArrow: { color: KINJO_COLORS.mutedText, fontSize: 18 },
  backText: { color: KINJO_COLORS.mutedText, fontSize: 14, fontWeight: '600' },
  step: { fontSize: 11, fontWeight: '700', color: KINJO_COLORS.success, letterSpacing: 2 },
  successBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: KINJO_COLORS.success, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  successIcon: { color: KINJO_COLORS.white, fontSize: 22, fontWeight: '900' },
  title: { fontSize: 32, fontWeight: '900', color: KINJO_COLORS.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: KINJO_COLORS.mutedText, lineHeight: 20 },
  orderSummaryCard: { backgroundColor: KINJO_COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: KINJO_COLORS.border, padding: 16, gap: 12 },
  sectionTitle: { color: KINJO_COLORS.white, fontSize: 16, fontWeight: '800' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailItem: { flex: 1, minWidth: '40%', backgroundColor: KINJO_COLORS.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: KINJO_COLORS.border, padding: 10, gap: 2 },
  detailLabel: { color: KINJO_COLORS.mutedText, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  detailValue: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: KINJO_COLORS.border, paddingTop: 12, marginTop: 2 },
  totalLabel: { color: KINJO_COLORS.white, fontSize: 15, fontWeight: '800' },
  totalValue: { color: KINJO_COLORS.gold, fontSize: 18, fontWeight: '900' },
  receiptCard: { backgroundColor: KINJO_COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: KINJO_COLORS.border, padding: 16, gap: 10 },
  optionRow: { borderRadius: 12, borderWidth: 1, borderColor: KINJO_COLORS.border, backgroundColor: KINJO_COLORS.surfaceElevated, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionRowActive: { borderColor: KINJO_COLORS.success, backgroundColor: '#0E2318' },
  optionRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: KINJO_COLORS.borderLight, alignItems: 'center', justifyContent: 'center' },
  optionRadioActive: { borderColor: KINJO_COLORS.success },
  optionRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: KINJO_COLORS.success },
  optionTexts: { flex: 1, gap: 2 },
  optionTitle: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '700' },
  optionTitleActive: { color: KINJO_COLORS.successLight },
  optionSubtitle: { color: KINJO_COLORS.mutedText, fontSize: 12 },
  contactWrap: { marginTop: 4, gap: 6 },
  contactLabel: { fontSize: 12, color: KINJO_COLORS.mutedText, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  contactInput: { borderWidth: 1, borderColor: KINJO_COLORS.border, borderRadius: 10, backgroundColor: KINJO_COLORS.surfaceElevated, color: KINJO_COLORS.white, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  contactHint: { color: KINJO_COLORS.mutedText, fontSize: 12 },
  finishButton: { borderRadius: 12, backgroundColor: KINJO_COLORS.success, alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  finishDisabled: { opacity: 0.35 },
  finishButtonText: { color: KINJO_COLORS.white, fontSize: 15, fontWeight: '800' },
});
