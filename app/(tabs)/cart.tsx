import { useEffect } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { KINJO_COLORS } from '@/lib/kinjo-data';
import { formatCurrency, formatServiceMode, useOrderStore } from '@/lib/order-store';

export default function CartScreen() {
  const router = useRouter();
  const { serviceMode, cart, subtotal, tax, totalBeforeTip, setItemQuantity, changeItemQuantity, clearCart } = useOrderStore();

  useEffect(() => { if (!serviceMode) router.replace('/'); }, [router, serviceMode]);

  if (!serviceMode) return null;
  const hasItems = cart.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <Text style={styles.step}>ETAPA 3 DE 5</Text>
          <Text style={styles.title}>Seu Carrinho</Text>
          <Text style={styles.subtitle}>{formatServiceMode(serviceMode)} · Revise antes de pagar</Text>
        </View>

        {!hasItems ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Carrinho vazio</Text>
            <Text style={styles.emptySubtitle}>Adicione itens do cardápio para continuar.</Text>
            <Pressable onPress={() => router.replace('/menu')} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>← Voltar ao Cardápio</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.cartList}>
              {cart.map((item) => (
                <View key={item.id} style={styles.cartCard}>
                  <View style={styles.cartCardTextWrap}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>{formatCurrency(item.price)} por unidade</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <Pressable onPress={() => changeItemQuantity(item.id, -1)} style={styles.quantityButton}>
                      <Text style={styles.quantityButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <Pressable onPress={() => changeItemQuantity(item.id, 1)} style={styles.quantityButton}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </Pressable>
                    <Pressable onPress={() => setItemQuantity(item.id, 0)} style={styles.removeButton}>
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </Pressable>
                    <Text style={styles.cartItemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.summaryCard}>
              <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text></View>
              {tax > 0 && <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Taxa</Text><Text style={styles.summaryValue}>{formatCurrency(tax)}</Text></View>}
              <View style={[styles.summaryLine, styles.summaryTotalLine]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(totalBeforeTip)}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable onPress={clearCart} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Limpar</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/payment')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Ir para Pagamento →</Text>
              </Pressable>
            </View>
          </>
        )}
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
  emptyState: { marginTop: 40, backgroundColor: KINJO_COLORS.surface, borderWidth: 1, borderColor: KINJO_COLORS.border, borderRadius: 20, padding: 24, gap: 10, alignItems: 'flex-start' },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: KINJO_COLORS.white },
  emptySubtitle: { fontSize: 14, color: KINJO_COLORS.mutedText, lineHeight: 20 },
  emptyButton: { marginTop: 10, backgroundColor: KINJO_COLORS.red, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 18 },
  emptyButtonText: { color: KINJO_COLORS.white, fontWeight: '700', fontSize: 14 },
  cartList: { gap: 10, paddingBottom: 14 },
  cartCard: { backgroundColor: KINJO_COLORS.surface, borderWidth: 1, borderColor: KINJO_COLORS.border, borderRadius: 14, padding: 16, gap: 12 },
  cartCardTextWrap: { gap: 3 },
  cartItemName: { fontSize: 17, fontWeight: '800', color: KINJO_COLORS.white },
  cartItemPrice: { fontSize: 13, color: KINJO_COLORS.mutedText },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quantityButton: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: KINJO_COLORS.borderLight, backgroundColor: KINJO_COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { fontSize: 18, fontWeight: '700', color: KINJO_COLORS.white },
  quantityValue: { minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: '700', color: KINJO_COLORS.white },
  removeButton: { paddingHorizontal: 8, paddingVertical: 4 },
  removeButtonText: { color: KINJO_COLORS.red, fontWeight: '600', fontSize: 13 },
  cartItemTotal: { marginLeft: 'auto', fontSize: 15, fontWeight: '800', color: KINJO_COLORS.gold },
  summaryCard: { backgroundColor: KINJO_COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: KINJO_COLORS.border, padding: 16, gap: 8, marginTop: 12 },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: KINJO_COLORS.mutedText, fontSize: 14 },
  summaryValue: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '600' },
  summaryTotalLine: { marginTop: 6, borderTopWidth: 1, borderTopColor: KINJO_COLORS.border, paddingTop: 10 },
  summaryTotalLabel: { color: KINJO_COLORS.white, fontSize: 16, fontWeight: '800' },
  summaryTotalValue: { color: KINJO_COLORS.gold, fontSize: 18, fontWeight: '900' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryButton: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: KINJO_COLORS.border, paddingVertical: 13, alignItems: 'center', backgroundColor: KINJO_COLORS.surface },
  secondaryButtonText: { color: KINJO_COLORS.mutedText, fontSize: 14, fontWeight: '700' },
  primaryButton: { flex: 2, borderRadius: 10, backgroundColor: KINJO_COLORS.red, paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '700' },
});


