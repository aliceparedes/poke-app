import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { KINJO_COLORS } from '@/lib/kinjo-data';
import { formatCurrency, useOrderStore } from '@/lib/order-store';

type PosState = 'waiting' | 'processing' | 'approved';

export default function PosScreen() {
  const router = useRouter();
  const { lastOrder } = useOrderStore();
  const displayTotal = lastOrder?.total ?? 0;
  const [posState, setPosState] = useState<PosState>('waiting');

  // Pulse animation for the waiting state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  // Fade in for approved state
  const approvedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse the card icon while waiting
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const simulatePayment = () => {
    setPosState('processing');

    // Animate progress bar over 2.5s
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setPosState('approved');
      Animated.timing(approvedAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Auto-navigate to receipt after 1.8s
      setTimeout(() => {
        router.replace('/receipt');
      }, 1800);
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepLabel}>TERMINAL DE PAGAMENTO</Text>
          <Text style={styles.title}>POS Kinjo</Text>
          <Text style={styles.subtitle}>Simulação de pagamento integrado</Text>
        </View>

        {/* POS Terminal Card */}
        <View style={styles.terminalCard}>

          {/* Terminal screen area */}
          <View style={styles.terminalScreen}>
            <View style={styles.terminalScreenHeader}>
              <View style={styles.terminalDot} />
              <View style={[styles.terminalDot, { backgroundColor: KINJO_COLORS.gold }]} />
              <View style={[styles.terminalDot, { backgroundColor: KINJO_COLORS.success }]} />
              <Text style={styles.terminalScreenTitle}>KINJO POS v1.0</Text>
            </View>

            {posState === 'waiting' && (
              <View style={styles.screenContent}>
                <Animated.Text style={[styles.posIcon, { transform: [{ scale: pulseAnim }] }]}>
                  💳
                </Animated.Text>
                <Text style={styles.posAmount}>{formatCurrency(displayTotal)}</Text>
                <Text style={styles.posInstruction}>Aproxime, insira ou passe seu cartão</Text>
                <View style={styles.posHintRow}>
                  <Text style={styles.posHint}>NFC  ·  CHIP  ·  TARJA</Text>
                </View>
              </View>
            )}

            {posState === 'processing' && (
              <View style={styles.screenContent}>
                <Text style={styles.posIcon}>⏳</Text>
                <Text style={styles.posAmount}>{formatCurrency(displayTotal)}</Text>
                <Text style={styles.posInstruction}>Processando pagamento...</Text>
                <Text style={styles.posHint}>Não retire o cartão</Text>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                </View>
              </View>
            )}

            {posState === 'approved' && (
              <Animated.View style={[styles.screenContent, { opacity: approvedAnim }]}>
                <Text style={styles.posIconApproved}>✅</Text>
                <Text style={styles.posAmountApproved}>{formatCurrency(displayTotal)}</Text>
                <Text style={styles.posApprovedText}>APROVADO</Text>
                <Text style={styles.posHint}>Redirecionando...</Text>
              </Animated.View>
            )}
          </View>

          {/* Terminal body details */}
          <View style={styles.terminalBody}>
            <View style={styles.cardSlot}>
              <View style={styles.cardSlotLine} />
              <Text style={styles.cardSlotLabel}>INSIRA O CARTÃO</Text>
              <View style={styles.cardSlotLine} />
            </View>
            <View style={styles.terminalButtons}>
              <View style={[styles.terminalBtn, { backgroundColor: '#8B0000' }]} />
              <View style={[styles.terminalBtn, { backgroundColor: '#004d00' }]} />
              <View style={[styles.terminalBtn, { backgroundColor: '#003580' }]} />
              <View style={[styles.terminalBtn, { backgroundColor: '#1a1a1a' }]} />
            </View>
          </View>
        </View>

        {/* Info strip */}
        <View style={styles.infoStrip}>
          <Text style={styles.infoText}>🔒 Conexão segura  ·  PCI DSS Compliant</Text>
        </View>

        {/* Action button */}
        {posState === 'waiting' && (
          <Pressable onPress={simulatePayment} style={styles.simulateButton}>
            <Text style={styles.simulateButtonText}>Simular Pagamento Aprovado →</Text>
          </Pressable>
        )}

        {posState === 'processing' && (
          <View style={styles.processingFooter}>
            <Text style={styles.processingFooterText}>Aguardando resposta do banco...</Text>
          </View>
        )}

        {posState === 'approved' && (
          <View style={styles.approvedFooter}>
            <Text style={styles.approvedFooterText}>✓ Pagamento confirmado! Preparando comprovante...</Text>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: KINJO_COLORS.background },
  container: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, alignItems: 'center', gap: 20 },

  header:   { alignItems: 'center', gap: 4 },
  stepLabel:{ fontSize: 11, fontWeight: '700', color: KINJO_COLORS.gold, letterSpacing: 2 },
  title:    { fontSize: 28, fontWeight: '900', color: KINJO_COLORS.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: KINJO_COLORS.mutedText },

  // Terminal card
  terminalCard: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },

  // Screen
  terminalScreen: {
    backgroundColor: '#0a1628',
    margin: 12,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E4D7B',
    minHeight: 260,
  },
  terminalScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E4D7B',
    paddingBottom: 10,
  },
  terminalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: KINJO_COLORS.red },
  terminalScreenTitle: { color: KINJO_COLORS.mutedText, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginLeft: 4 },

  screenContent: { alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' },
  posIcon:         { fontSize: 52 },
  posIconApproved: { fontSize: 52 },
  posAmount:         { fontSize: 32, fontWeight: '900', color: KINJO_COLORS.white, letterSpacing: -1 },
  posAmountApproved: { fontSize: 32, fontWeight: '900', color: KINJO_COLORS.success, letterSpacing: -1 },
  posInstruction: { color: KINJO_COLORS.mutedText, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  posHint:        { color: '#4a7a9b', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  posHintRow:     { marginTop: 4 },
  posApprovedText:{ color: KINJO_COLORS.success, fontSize: 22, fontWeight: '900', letterSpacing: 4 },

  progressTrack: { width: '100%', height: 6, backgroundColor: KINJO_COLORS.border, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressBar:   { height: 6, backgroundColor: KINJO_COLORS.gold, borderRadius: 3 },

  // Terminal body
  terminalBody: { padding: 16, gap: 16 },
  cardSlot: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardSlotLine: { flex: 1, height: 2, backgroundColor: '#333', borderRadius: 1 },
  cardSlotLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  terminalButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  terminalBtn: { width: 36, height: 22, borderRadius: 4 },

  // Info strip
  infoStrip: { backgroundColor: KINJO_COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: KINJO_COLORS.border, paddingHorizontal: 16, paddingVertical: 10, width: '100%', alignItems: 'center' },
  infoText:  { color: KINJO_COLORS.mutedText, fontSize: 12, fontWeight: '600' },

  // Buttons / footers
  simulateButton: { width: '100%', backgroundColor: KINJO_COLORS.red, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  simulateButtonText: { color: KINJO_COLORS.white, fontSize: 15, fontWeight: '800' },

  processingFooter: { width: '100%', alignItems: 'center' },
  processingFooterText: { color: KINJO_COLORS.mutedText, fontSize: 13, fontWeight: '600' },

  approvedFooter: { width: '100%', backgroundColor: '#0E2318', borderRadius: 12, borderWidth: 1, borderColor: KINJO_COLORS.success, paddingVertical: 14, alignItems: 'center' },
  approvedFooterText: { color: KINJO_COLORS.success, fontSize: 14, fontWeight: '700' },
});
