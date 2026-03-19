import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { KINJO_COLORS, PAYMENT_OPTIONS, TIP_OPTIONS } from '@/lib/kinjo-data';
import { formatCurrency, formatPaymentMethod, formatServiceMode, useOrderStore } from '@/lib/order-store';

export default function PaymentScreen() {
  const router = useRouter();
  const {
    serviceMode, cart, itemCount, subtotal, tax, totalBeforeTip,
    tipPercent, setTipPercent, tip, grandTotal,
    paymentMethod, setPaymentMethod, confirmPayment,
  } = useOrderStore();

  const [customTipInput, setCustomTipInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (isPaying) return;
    if (!serviceMode) { router.replace('/'); return; }
    if (cart.length === 0) router.replace('/menu');
  }, [cart.length, router, serviceMode, isPaying]);

  if (!serviceMode || cart.length === 0) return null;

  const isCustomActive = !TIP_OPTIONS.includes(tipPercent) && tipPercent > 0;

  const applyCustomTip = () => {
    const parsed = parseFloat(customTipInput.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      setTipPercent(parsed);
      setShowCustomInput(false);
    }
  };

  const finalizePayment = () => {
    setIsPaying(true);
    const order = confirmPayment();
    if (order) {
      router.replace('/pos');
    } else {
      setIsPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <Text style={styles.step}>ETAPA 4 DE 5</Text>
          <Text style={styles.title}>Pagamento</Text>
          <Text style={styles.subtitle}>{formatServiceMode(serviceMode)} · Finalização segura</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
            {PAYMENT_OPTIONS.map((option) => {
              const active = option.id === paymentMethod;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setPaymentMethod(option.id)}
                  style={[styles.optionCard, active && styles.optionCardActive]}
                >
                  <View style={styles.optionRow}>
                    <View style={[styles.optionRadio, active && styles.optionRadioActive]}>
                      {active && <View style={styles.optionRadioDot} />}
                    </View>
                    <View style={styles.optionTexts}>
                      <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionHelper}>{option.helper}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gorjeta</Text>
            <View style={styles.tipRow}>
              {TIP_OPTIONS.map((option) => {
                const active = option === tipPercent && !isCustomActive;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setTipPercent(option);
                      setShowCustomInput(false);
                      setCustomTipInput('');
                    }}
                    style={[styles.tipButton, active && styles.tipButtonActive]}
                  >
                    <Text style={[styles.tipButtonText, active && styles.tipButtonTextActive]}>
                      {option === 0 ? 'Sem gorjeta' : `${option}%`}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setShowCustomInput((p) => !p)}
                style={[styles.tipButton, (showCustomInput || isCustomActive) && styles.tipButtonActive]}
              >
                <Text style={[styles.tipButtonText, (showCustomInput || isCustomActive) && styles.tipButtonTextActive]}>
                  {isCustomActive ? `${tipPercent}%` : 'Outro %'}
                </Text>
              </Pressable>
            </View>
            {showCustomInput && (
              <View style={styles.customTipWrap}>
                <TextInput
                  style={styles.customTipInput}
                  placeholder="Ex: 12"
                  placeholderTextColor={KINJO_COLORS.mutedText}
                  keyboardType="decimal-pad"
                  value={customTipInput}
                  onChangeText={setCustomTipInput}
                />
                <Text style={styles.customTipPercent}>%</Text>
                <Pressable onPress={applyCustomTip} style={styles.customTipApply}>
                  <Text style={styles.customTipApplyText}>Aplicar</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Quantidade de itens</Text>
              <Text style={styles.summaryValue}>{itemCount}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {tax > 0 && (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Taxa</Text>
                <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
              </View>
            )}
            {tip > 0 && (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Gorjeta ({tipPercent}%)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(tip)}</Text>
              </View>
            )}
            <View style={[styles.summaryLine, styles.summaryTotalLine]}>
              <Text style={styles.summaryTotalLabel}>Total a Pagar</Text>
              <Text style={styles.summaryTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
            <Text style={styles.summaryCaption}>
              Pagamento via: {formatPaymentMethod(paymentMethod)}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.actionsRow}>
          <Pressable onPress={() => router.push('/cart')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>← Carrinho</Text>
          </Pressable>
          <Pressable onPress={finalizePayment} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Pagar {formatCurrency(grandTotal)}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: KINJO_COLORS.background },
  container: { flex: 1, width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  header: { marginBottom: 18 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, alignSelf: 'flex-start' },
  backArrow: { color: KINJO_COLORS.mutedText, fontSize: 18 },
  backText: { color: KINJO_COLORS.mutedText, fontSize: 14, fontWeight: '600' },
  step: { fontSize: 11, fontWeight: '700', color: KINJO_COLORS.red, letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: '900', color: KINJO_COLORS.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: KINJO_COLORS.mutedText },
  content: { gap: 14, paddingBottom: 12 },
  section: { backgroundColor: KINJO_COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: KINJO_COLORS.border, padding: 16, gap: 10 },
  sectionTitle: { color: KINJO_COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  optionCard: { borderRadius: 12, borderWidth: 1, borderColor: KINJO_COLORS.border, padding: 14, backgroundColor: KINJO_COLORS.surfaceElevated },
  optionCardActive: { borderColor: KINJO_COLORS.red, backgroundColor: '#2A1518' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: KINJO_COLORS.borderLight, alignItems: 'center', justifyContent: 'center' },
  optionRadioActive: { borderColor: KINJO_COLORS.red },
  optionRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: KINJO_COLORS.red },
  optionTexts: { gap: 2, flex: 1 },
  optionTitle: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '700' },
  optionTitleActive: { color: KINJO_COLORS.white },
  optionHelper: { color: KINJO_COLORS.mutedText, fontSize: 12 },
  tipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tipButton: { flex: 1, minWidth: 70, borderRadius: 10, borderWidth: 1, borderColor: KINJO_COLORS.border, backgroundColor: KINJO_COLORS.surfaceElevated, paddingVertical: 10, alignItems: 'center' },
  tipButtonActive: { borderColor: KINJO_COLORS.gold, backgroundColor: '#241C04' },
  tipButtonText: { color: KINJO_COLORS.mutedText, fontWeight: '700', fontSize: 13 },
  tipButtonTextActive: { color: KINJO_COLORS.gold },
  customTipWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  customTipInput: { flex: 1, borderWidth: 1, borderColor: KINJO_COLORS.gold, borderRadius: 10, backgroundColor: KINJO_COLORS.surfaceElevated, color: KINJO_COLORS.white, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, fontWeight: '700' },
  customTipPercent: { color: KINJO_COLORS.gold, fontSize: 16, fontWeight: '700' },
  customTipApply: { backgroundColor: KINJO_COLORS.gold, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  customTipApplyText: { color: KINJO_COLORS.background, fontWeight: '800', fontSize: 14 },
  summaryCard: { backgroundColor: KINJO_COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: KINJO_COLORS.border, padding: 16, gap: 8 },
  summaryTitle: { color: KINJO_COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: KINJO_COLORS.mutedText, fontSize: 14 },
  summaryValue: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '600' },
  summaryTotalLine: { marginTop: 6, borderTopWidth: 1, borderTopColor: KINJO_COLORS.border, paddingTop: 10 },
  summaryTotalLabel: { color: KINJO_COLORS.white, fontWeight: '900', fontSize: 17 },
  summaryTotalValue: { color: KINJO_COLORS.gold, fontWeight: '900', fontSize: 18 },
  summaryCaption: { marginTop: 2, color: KINJO_COLORS.mutedText, fontSize: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondaryButton: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: KINJO_COLORS.border, backgroundColor: KINJO_COLORS.surface, paddingVertical: 13, alignItems: 'center' },
  secondaryButtonText: { color: KINJO_COLORS.mutedText, fontWeight: '700', fontSize: 14 },
  primaryButton: { flex: 2, borderRadius: 10, backgroundColor: KINJO_COLORS.red, paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: KINJO_COLORS.white, fontWeight: '700', fontSize: 14 },
});