import { useState, useMemo, useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  KINJO_COLORS,
  CUSTOM_STEPS,
  CUSTOM_BOWL_BASE_PRICE,
  CustomStep,
} from '@/lib/kinjo-data';
import { formatCurrency, useOrderStore } from '@/lib/order-store';

export default function CustomBowlScreen() {
  const router = useRouter();
  const { addCustomItem, serviceMode } = useOrderStore();

  useEffect(() => {
    if (!serviceMode) {
      const t = setTimeout(() => router.replace('/'), 0);
      return () => clearTimeout(t);
    }
  }, [router, serviceMode]);

  // selections: key -> array of selected option ids
  const [selections, setSelections] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(CUSTOM_STEPS.map((s) => [s.key, []]))
  );
  const [currentStep, setCurrentStep] = useState(0);

  const step: CustomStep = CUSTOM_STEPS[currentStep];
  const stepSelections = selections[step.key] ?? [];
  const isLastStep = currentStep === CUSTOM_STEPS.length - 1;

  // Calculate total price: base + protein AD fee
  const totalPrice = useMemo(() => {
    const proteinId = selections['proteina']?.[0];
    const proteinOption = CUSTOM_STEPS.find((s) => s.key === 'proteina')?.options.find((o) => o.id === proteinId);
    return CUSTOM_BOWL_BASE_PRICE + (proteinOption?.adPrice ?? 0);
  }, [selections]);

  // Summary labels for the review strip
  const summaryLines = useMemo(() => {
    return CUSTOM_STEPS.map((s) => {
      const chosen = selections[s.key] ?? [];
      if (chosen.length === 0) return null;
      const labels = chosen.map((id) => s.options.find((o) => o.id === id)?.label ?? id);
      return `${s.title}: ${labels.join(', ')}`;
    }).filter(Boolean) as string[];
  }, [selections]);

  if (!serviceMode) return null;

  const canProceed = !step.required || stepSelections.length > 0;

  const toggle = (optionId: string) => {
    setSelections((prev) => {
      const current = prev[step.key] ?? [];
      if (current.includes(optionId)) {
        return { ...prev, [step.key]: current.filter((id) => id !== optionId) };
      }
      if (step.max === 1) {
        return { ...prev, [step.key]: [optionId] };
      }
      if (current.length >= step.max) return prev; // at max
      return { ...prev, [step.key]: [...current, optionId] };
    });
  };

  const next = () => {
    if (!canProceed) return;
    if (isLastStep) {
      addToCartAndLeave();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const addToCartAndLeave = () => {
    const proteinLabel = selections['proteina']?.[0]
      ? CUSTOM_STEPS.find((s) => s.key === 'proteina')!.options.find(
          (o) => o.id === selections['proteina'][0]
        )?.label ?? 'Bowl'
      : 'Bowl';

    const descParts = CUSTOM_STEPS.slice(1).map((s) => {
      const chosen = selections[s.key] ?? [];
      if (chosen.length === 0) return null;
      const labels = chosen.map((id) => s.options.find((o) => o.id === id)?.label ?? id);
      return labels.join(', ');
    }).filter(Boolean);

    addCustomItem({
      id: `custom-${Date.now()}`,
      category: 'Bowls' as const,
      name: `Bowl ${proteinLabel}`,
      description: descParts.join(' · '),
      price: totalPrice,
    });

    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <Text style={styles.step}>MONTE SEU BOWL</Text>
          <Text style={styles.title}>Personalizado</Text>
          <Text style={styles.subtitle}>Cada detalhe do jeito que você gosta.</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          {CUSTOM_STEPS.map((s, i) => (
            <Pressable
              key={s.key}
              onPress={() => i < currentStep && setCurrentStep(i)}
              style={[
                styles.progressSegment,
                i < currentStep && styles.progressDone,
                i === currentStep && styles.progressActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>
          Passo {currentStep + 1} de {CUSTOM_STEPS.length} · {step.title}
        </Text>

        {/* Step card */}
        <View style={styles.stepCard}>
          <View style={styles.stepCardHeader}>
            <View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            </View>
            {stepSelections.length > 0 && step.max > 1 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{stepSelections.length}/{step.max}</Text>
              </View>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}>
            {step.options.map((option) => {
              const selected = stepSelections.includes(option.id);
              const maxed = !selected && stepSelections.length >= step.max;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => !maxed && toggle(option.id)}
                  style={[
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                    maxed && styles.optionRowMaxed,
                  ]}>
                  <View style={[
                    styles.optionCheck,
                    selected && styles.optionCheckSelected,
                    step.max === 1 && styles.optionCheckRound,
                    selected && step.max === 1 && styles.optionCheckRoundSelected,
                  ]}>
                    {selected && <Text style={styles.optionCheckMark}>{step.max === 1 ? '●' : '✓'}</Text>}
                  </View>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected, maxed && styles.optionLabelMaxed]}>
                    {option.label}
                  </Text>
                  {option.adPrice != null && (
                    <Text style={[styles.optionAdPrice, selected && styles.optionAdPriceSelected]}>
                      +R$ {option.adPrice}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Review strip */}
        {summaryLines.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.summaryStrip}
            contentContainerStyle={styles.summaryStripContent}>
            {summaryLines.map((line, i) => (
              <View key={i} style={styles.summaryChip}>
                <Text style={styles.summaryChipText} numberOfLines={1}>{line}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceLabel}>Total do bowl</Text>
            <Text style={styles.footerPriceValue}>{formatCurrency(totalPrice)}</Text>
          </View>
          <View style={styles.footerButtons}>
            {currentStep > 0 && (
              <Pressable onPress={() => setCurrentStep((s) => s - 1)} style={styles.prevButton}>
                <Text style={styles.prevButtonText}>← Anterior</Text>
              </Pressable>
            )}
            <Pressable
              onPress={next}
              style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}>
              <Text style={styles.nextButtonText}>
                {isLastStep ? '+ Adicionar ao Carrinho' : `Próximo: ${CUSTOM_STEPS[currentStep + 1]?.title} →`}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: KINJO_COLORS.background },
  container: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 16 },

  header:     { marginBottom: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, alignSelf: 'flex-start' },
  backArrow:  { color: KINJO_COLORS.mutedText, fontSize: 18 },
  backText:   { color: KINJO_COLORS.mutedText, fontSize: 14, fontWeight: '600' },
  step:       { fontSize: 11, fontWeight: '700', color: KINJO_COLORS.gold, letterSpacing: 2, marginBottom: 2 },
  title:      { fontSize: 32, fontWeight: '900', color: KINJO_COLORS.white, letterSpacing: -0.5 },
  subtitle:   { fontSize: 14, color: KINJO_COLORS.mutedText },

  progressTrack:   { flexDirection: 'row', gap: 5, marginBottom: 6 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: KINJO_COLORS.border },
  progressDone:    { backgroundColor: KINJO_COLORS.gold },
  progressActive:  { backgroundColor: KINJO_COLORS.red },
  progressLabel:   { color: KINJO_COLORS.mutedText, fontSize: 12, marginBottom: 12 },

  stepCard: {
    flex: 1,
    backgroundColor: KINJO_COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: KINJO_COLORS.border,
    padding: 16,
    marginBottom: 10,
  },
  stepCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  stepTitle:      { fontSize: 20, fontWeight: '800', color: KINJO_COLORS.white },
  stepSubtitle:   { fontSize: 13, color: KINJO_COLORS.mutedText, marginTop: 2 },
  countBadge:     { backgroundColor: KINJO_COLORS.surfaceElevated, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: KINJO_COLORS.borderLight },
  countBadgeText: { color: KINJO_COLORS.gold, fontWeight: '800', fontSize: 13 },

  optionsList: { gap: 8, paddingBottom: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: KINJO_COLORS.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: KINJO_COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionRowSelected: { borderColor: KINJO_COLORS.gold, backgroundColor: '#1C2A3A' },
  optionRowMaxed:    { opacity: 0.35 },

  optionCheck: {
    width: 22, height: 22, borderRadius: 4, borderWidth: 1.5,
    borderColor: KINJO_COLORS.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  optionCheckSelected:      { backgroundColor: KINJO_COLORS.gold, borderColor: KINJO_COLORS.gold },
  optionCheckRound:         { borderRadius: 11 },
  optionCheckRoundSelected: { backgroundColor: KINJO_COLORS.gold, borderColor: KINJO_COLORS.gold },
  optionCheckMark:          { color: KINJO_COLORS.background, fontSize: 11, fontWeight: '900' },

  optionLabel:           { flex: 1, color: KINJO_COLORS.white, fontSize: 14, fontWeight: '600' },
  optionLabelSelected:   { color: KINJO_COLORS.gold, fontWeight: '700' },
  optionLabelMaxed:      { color: KINJO_COLORS.mutedText },
  optionAdPrice:         { color: KINJO_COLORS.mutedText, fontSize: 12, fontWeight: '600' },
  optionAdPriceSelected: { color: KINJO_COLORS.gold },

  summaryStrip:        { maxHeight: 40, marginBottom: 8, marginHorizontal: -20 },
  summaryStripContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  summaryChip:         { backgroundColor: KINJO_COLORS.surfaceElevated, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: KINJO_COLORS.borderLight },
  summaryChipText:     { color: KINJO_COLORS.mutedText, fontSize: 11, fontWeight: '600', maxWidth: 180 },

  footer:          { paddingVertical: 12, gap: 10 },
  footerPrice:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerPriceLabel:{ color: KINJO_COLORS.mutedText, fontSize: 13 },
  footerPriceValue:{ color: KINJO_COLORS.gold, fontSize: 20, fontWeight: '900' },
  footerButtons:   { flexDirection: 'row', gap: 10 },

  prevButton:         { borderRadius: 12, borderWidth: 1, borderColor: KINJO_COLORS.border, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', backgroundColor: KINJO_COLORS.surface },
  prevButtonText:     { color: KINJO_COLORS.mutedText, fontWeight: '700', fontSize: 14 },
  nextButton:         { flex: 1, borderRadius: 12, backgroundColor: KINJO_COLORS.red, paddingVertical: 14, alignItems: 'center' },
  nextButtonDisabled: { opacity: 0.4 },
  nextButtonText:     { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '800' },
});