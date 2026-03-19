import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { KINJO_COLORS, ServiceMode } from '@/lib/kinjo-data';
import { formatServiceMode, useOrderStore } from '@/lib/order-store';

const SERVICE_OPTIONS: Array<{ id: ServiceMode; title: string; subtitle: string }> = [
  { id: 'eat-here', title: 'Comer Aqui',  subtitle: 'Sente-se e chamamos você pelo número do pedido.' },
  { id: 'to-go',    title: 'Para Viagem', subtitle: 'Retire em minutos no balcão expresso.' },
];

export default function StartOrderScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { serviceMode, setServiceMode } = useOrderStore();
  const isWide = width >= 820;

  const startOrder = (mode: ServiceMode) => {
    setServiceMode(mode);
    router.push('/menu');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NIKKEI POKE</Text>
            </View>
          </View>
          <Text style={styles.brand}>
            KINJO <Text style={styles.brandPoke}>POKE</Text>
          </Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Escolha como prefere receber seu pedido para começar.
          </Text>
        </View>

        <View style={[styles.optionWrap, isWide && styles.optionWrapWide]}>
          {SERVICE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => startOrder(option.id)}
              style={({ pressed }) => [
                styles.optionCard,
                isWide && styles.optionCardWide,
                pressed && styles.optionCardPressed,
              ]}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              <View style={styles.optionCTA}>
                <Text style={styles.optionCTAText}>Iniciar Pedido →</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {serviceMode && (
          <View style={styles.footerBlock}>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>
              Último modo selecionado: {formatServiceMode(serviceMode)}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: KINJO_COLORS.background },
  blobTopRight: { position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: KINJO_COLORS.red, opacity: 0.12 },
  blobBottomLeft: { position: 'absolute', bottom: -100, left: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: KINJO_COLORS.gold, opacity: 0.08 },
  container: { flex: 1, width: '100%', maxWidth: 1040, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24, gap: 32 },
  headerBlock: { gap: 10 },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  badge: { borderWidth: 1, borderColor: KINJO_COLORS.gold, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: KINJO_COLORS.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  brand: { color: KINJO_COLORS.white, fontSize: 52, fontWeight: '900', letterSpacing: -1, lineHeight: 60 },
  brandPoke: { color: KINJO_COLORS.red, fontSize: 52, fontWeight: '900', letterSpacing: -1 },
  divider: { width: 48, height: 3, backgroundColor: KINJO_COLORS.red, borderRadius: 2, marginTop: 8, marginBottom: 4 },
  subtitle: { color: KINJO_COLORS.mutedText, fontSize: 16, lineHeight: 24, maxWidth: 480 },
  optionWrap: { gap: 14 },
  optionWrapWide: { flexDirection: 'row' },
  optionCard: { backgroundColor: KINJO_COLORS.surfaceElevated, borderWidth: 1, borderColor: KINJO_COLORS.borderLight, borderRadius: 20, padding: 22, gap: 10, minHeight: 180 },
  optionCardWide: { flex: 1, minHeight: 230 },
  optionCardPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  optionTitle: { color: KINJO_COLORS.white, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  optionSubtitle: { color: KINJO_COLORS.mutedText, fontSize: 15, lineHeight: 22 },
  optionCTA: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: KINJO_COLORS.red, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  optionCTAText: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '700' },
  footerBlock: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: KINJO_COLORS.border, paddingTop: 14 },
  footerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: KINJO_COLORS.gold },
  footerText: { color: KINJO_COLORS.mutedText, fontSize: 13 },
});

