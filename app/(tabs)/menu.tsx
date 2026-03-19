import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';

import { KINJO_COLORS, MENU_CATEGORIES, MENU_ITEMS, MenuCategory } from '@/lib/kinjo-data';
import { formatCurrency, formatServiceMode, useOrderStore } from '@/lib/order-store';

const CATEGORY_LABELS: Record<MenuCategory, string> = { Ceviches: 'Ceviches', Bebidas: 'Bebidas' };

export default function MenuScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { serviceMode, addToCart, itemCount, totalBeforeTip } = useOrderStore();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Ceviches');

  useEffect(() => {
    if (!serviceMode) {
      const t = setTimeout(() => router.replace('/'), 0);
      return () => clearTimeout(t);
    }
  }, [router, serviceMode]);

  const filteredItems = useMemo(() => MENU_ITEMS.filter((item) => item.category === selectedCategory), [selectedCategory]);

  if (!serviceMode) return null;
  const isWide = width >= 960;
  const isCompact = width < 390;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <Text style={styles.step}>ETAPA 2 DE 5</Text>
          <Text style={styles.title}>Cardápio</Text>
          <Text style={styles.subtitle}>{formatServiceMode(serviceMode)} · Escolha seus itens</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryScrollContent}>
          {/* Monte seu Bowl — first chip */}
          <Pressable
            onPress={() => router.push('/custom-bowl')}
            style={[styles.categoryChip, styles.categoryChipCustom, isCompact && styles.categoryChipCompact]}>
            <Text style={[styles.categoryChipText, styles.categoryChipTextCustom, isCompact && styles.categoryChipTextCompact]}>
              ✦ Monte seu Bowl
            </Text>
          </Pressable>

          {MENU_CATEGORIES.map((category) => {
            const active = category === selectedCategory;
            return (
              <Pressable key={category} onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, active && styles.categoryChipActive, isCompact && styles.categoryChipCompact]}>
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive, isCompact && styles.categoryChipTextCompact]}>
                  {CATEGORY_LABELS[category]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.menuGrid}>
            {filteredItems.map((item) => (
              <View key={item.id} style={[styles.menuCard, isWide && styles.menuCardWide]}>
                {/* Left thumbnail */}
                {item.image && (
                  <Image
                    source={item.image}
                    style={styles.menuCardImage}
                    resizeMode="cover"
                  />
                )}
                {/* Right content */}
                <View style={styles.menuCardContent}>
                  <View style={styles.menuCardTop}>
                    <Text style={styles.menuCardTitle}>{item.name}</Text>
                    <Text style={styles.menuCardDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.menuCardBottom}>
                    <Text style={styles.menuCardPrice}>{formatCurrency(item.price)}</Text>
                    <Pressable onPress={() => addToCart(item.id)} style={styles.addButton}>
                      <Text style={styles.addButtonText}>+ Adicionar</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {itemCount > 0 ? (
          <View style={styles.cartBar}>
            <View style={styles.cartBarTextWrap}>
              <Text style={styles.cartBarTitle}>{itemCount} item(s) no carrinho</Text>
              <Text style={styles.cartBarSubtitle}>{formatCurrency(totalBeforeTip)}</Text>
            </View>
            <Pressable onPress={() => router.push('/cart')} style={styles.cartBarButton}>
              <Text style={styles.cartBarButtonText}>Ver Carrinho →</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cartBarEmpty}>
            <Text style={styles.cartBarEmptyText}>Adicione itens para continuar.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: KINJO_COLORS.background },
  container: { flex: 1, width: '100%', maxWidth: 1100, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 18 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, alignSelf: 'flex-start' },
  backArrow: { color: KINJO_COLORS.mutedText, fontSize: 18 },
  backText: { color: KINJO_COLORS.mutedText, fontSize: 14, fontWeight: '600' },
  step: { fontSize: 11, fontWeight: '700', color: KINJO_COLORS.red, letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: '900', color: KINJO_COLORS.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: KINJO_COLORS.mutedText },
  categoryScroll: { marginHorizontal: -20, marginBottom: 8 },
  categoryScrollContent: { paddingHorizontal: 20, paddingBottom: 12, alignItems: 'center' },
  categoryChip: { borderRadius: 999, borderWidth: 1, borderColor: KINJO_COLORS.borderLight, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: KINJO_COLORS.surface, marginRight: 8, minWidth: 90, alignItems: 'center' },
  categoryChipActive: { backgroundColor: KINJO_COLORS.red, borderColor: KINJO_COLORS.red },
  categoryChipCustom: { backgroundColor: KINJO_COLORS.surfaceElevated, borderColor: KINJO_COLORS.gold, borderWidth: 1.5, minWidth: 0 },
  categoryChipTextCustom: { color: KINJO_COLORS.gold, fontWeight: '700' },
  categoryChipCompact: { paddingHorizontal: 14, paddingVertical: 8 },
  categoryChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  categoryChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  categoryChipTextCompact: { fontSize: 12 },
  listContent: { paddingBottom: 30, paddingTop: 10 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  menuCard: {
    width: '100%',
    minHeight: 110,
    backgroundColor: KINJO_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KINJO_COLORS.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  menuCardWide: { width: '49%' },
  menuCardImage: {
    width: 110,
    height: '100%',
    minHeight: 110,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  menuCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  menuCardTop: { gap: 4 },
  menuCardTitle: { fontSize: 16, fontWeight: '800', color: KINJO_COLORS.white, letterSpacing: -0.3 },
  menuCardDescription: { fontSize: 12, lineHeight: 17, color: KINJO_COLORS.mutedText },
  menuCardBottom: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuCardPrice: { fontSize: 16, fontWeight: '800', color: KINJO_COLORS.gold },
  addButton: { backgroundColor: KINJO_COLORS.red, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { color: KINJO_COLORS.white, fontSize: 12, fontWeight: '700' },
  bottomSpacer: { height: 80 },
  cartBar: { borderTopWidth: 1, borderColor: KINJO_COLORS.border, backgroundColor: KINJO_COLORS.surfaceElevated, marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  cartBarTextWrap: { gap: 2 },
  cartBarTitle: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '700' },
  cartBarSubtitle: { color: KINJO_COLORS.gold, fontSize: 14, fontWeight: '700' },
  cartBarButton: { backgroundColor: KINJO_COLORS.red, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  cartBarButtonText: { color: KINJO_COLORS.white, fontSize: 14, fontWeight: '700' },
  cartBarEmpty: { borderTopWidth: 1, borderColor: KINJO_COLORS.border, marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 16 },
  cartBarEmptyText: { color: KINJO_COLORS.mutedText, fontSize: 13 },
});






