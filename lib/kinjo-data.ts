export type ServiceMode = 'eat-here' | 'to-go';
export type MenuCategory = 'Ceviches' | 'Bebidas';
export type CustomCategory = 'Bowls'; // used only for custom bowl items
export type PaymentMethod = 'card' | 'apple-pay' | 'cash';
export type ReceiptMethod = 'none' | 'email' | 'sms' | 'print';

export interface MenuItem {
  id: string;
  category: MenuCategory | CustomCategory;
  name: string;
  description: string;
  price: number;
  image?: any; // optional local image via require()
}

// ─── CUSTOM BOWL BUILDER ─────────────────────────────────────────────────────

export interface CustomOption {
  id: string;
  label: string;
  adPrice?: number;
}

export interface CustomStep {
  key: string;
  title: string;
  subtitle: string;
  max: number;
  required: boolean;
  options: CustomOption[];
}

export const CUSTOM_STEPS: CustomStep[] = [
  {
    key: 'proteina',
    title: 'Proteína',
    subtitle: 'Escolha 1 proteína',
    max: 1,
    required: true,
    options: [
      { id: 'salmao',          label: 'Salmão',            adPrice: 12 },
      { id: 'atum',            label: 'Atum',              adPrice: 12 },
      { id: 'peixe-branco',    label: 'Peixe Branco',      adPrice: 10 },
      { id: 'frango-crocante', label: 'Frango Crocante',   adPrice: 9  },
      { id: 'pipoca-camarao',  label: 'Pipoca de Camarão', adPrice: 12 },
    ],
  },
  {
    key: 'base',
    title: 'Base',
    subtitle: 'Escolha 1 base',
    max: 1,
    required: true,
    options: [
      { id: 'arroz',          label: 'Arroz'          },
      { id: 'arroz-integral', label: 'Arroz Integral' },
      { id: 'mix-quinoa',     label: 'Mix de Quinoa'  },
    ],
  },
  {
    key: 'molho',
    title: 'Molho',
    subtitle: 'Escolha 1 molho',
    max: 1,
    required: true,
    options: [
      { id: 'shoyo',            label: 'Shoyo'            },
      { id: 'tare',             label: 'Tare'             },
      { id: 'teriyaki-trufado', label: 'Teriyaki Trufado' },
      { id: 'nikkei-kinjo',     label: 'Nikkei Kinjo'     },
      { id: 'acevichado-spacy', label: 'Acevichado Spacy' },
      { id: 'pesto-citrico',    label: 'Pesto Cítrico'    },
      { id: 'kinjo-fogo',       label: 'Kinjo Fogo!!!'    },
    ],
  },
  {
    key: 'complementos',
    title: 'Complementos',
    subtitle: 'Escolha até 3 complementos',
    max: 3,
    required: false,
    options: [
      { id: 'cream-cheese',   label: 'Cream Cheese'     },
      { id: 'manga',          label: 'Manga'            },
      { id: 'pepino-japones', label: 'Pepino Japonês'   },
      { id: 'mix-cogumelos',  label: 'Mix de Cogumelos' },
      { id: 'cenoura',        label: 'Cenoura'          },
      { id: 'tomate-cereja',  label: 'Tomate Cereja'    },
      { id: 'sunomono',       label: 'Sunomono'         },
      { id: 'edamame',        label: 'Edamame'          },
      { id: 'rabanito',       label: 'Rabanito'         },
      { id: 'abacate',        label: 'Abacate'          },
      { id: 'cebola-roxa',    label: 'Cebola Roxa'      },
      { id: 'gengibre-doce',  label: 'Gengibre Doce'    },
      { id: 'ovo-codorna',    label: 'Ovo de Codorna'   },
      { id: 'kani-kama',      label: 'Kani Kama'        },
    ],
  },
  {
    key: 'crispy',
    title: 'Nossos Crispys',
    subtitle: 'Escolha até 2 crispys',
    max: 2,
    required: false,
    options: [
      { id: 'cebola-crispy',      label: 'Cebola Crispy'        },
      { id: 'chips-batata-doce',  label: 'Chips de Batata Doce' },
      { id: 'batata-baroa-palha', label: 'Batata Baroa Palha'   },
      { id: 'couve-crispy',       label: 'Couve Crispy'         },
      { id: 'chips-coco',         label: 'Chips de Coco'        },
      { id: 'furikake',           label: 'Furikake'             },
      { id: 'tenkasu',            label: 'Tenkasu'              },
    ],
  },
  {
    key: 'nuts',
    title: 'Nossos Nuts',
    subtitle: 'Escolha 1 nuts',
    max: 1,
    required: false,
    options: [
      { id: 'amendoim-torrado', label: 'Amendoim Torrado' },
      { id: 'amendoa-laminada', label: 'Amendoa Laminada' },
      { id: 'castanha-caju',    label: 'Castanha de Caju' },
      { id: 'milho-peruano',    label: 'Milho Peruano'    },
    ],
  },
];

export const CUSTOM_BOWL_BASE_PRICE = 35;

// ─── COLORS ──────────────────────────────────────────────────────────────────
export const KINJO_COLORS = {
  background:      '#2e6190',
  surface:         '#163A5F',
  surfaceElevated: '#1A4470',
  border:          '#1E4D7B',
  borderLight:     '#2A5F90',
  text:            '#FFFFFF',
  mutedText:       '#7BAAC6',
  textOnLight:     '#0F2D4A',
  red:             '#C8373D',
  redDark:         '#A02C31',
  redLight:        '#FFE4E5',
  gold:            '#F0BC2E',
  goldLight:       '#FDF3D0',
  success:         '#27AE60',
  successLight:    '#E6F9EE',
  white:           '#FFFFFF',
} as const;

// ─── MENU ─────────────────────────────────────────────────────────────────────
export const MENU_CATEGORIES: MenuCategory[] = ['Ceviches', 'Bebidas'];

export const MENU_ITEMS: MenuItem[] = [
  // ── Ceviches ──────────────────────────────────────────────────────────────
  {
    id: 'ceviche-classico',
    category: 'Ceviches',
    name: 'Clássico Peruano',
    description: 'Peixe branco, leite de tigre, milhos, batata doce e crocante.',
    price: 42,
    image: require('../assets/images/ceviche-classico.jpg'),
  },
  {
    id: 'ceviche-trufado',
    category: 'Ceviches',
    name: 'Trufado',
    description: 'Salmão, cebola, pepino, abacate com leite de tigre trufado e temperos orientais.',
    price: 46,
    image: require('../assets/images/ceviche-trufado.jpg'),
  },
  {
    id: 'ceviche-nikkei',
    category: 'Ceviches',
    name: 'Nikkei',
    description: 'Atum, molho acevichado spicy, cebola, pepino, cebolinha e tenkasu.',
    price: 44,
    image: require('../assets/images/ceviche-nikkei.jpg'),
  },

  // ── Bebidas ───────────────────────────────────────────────────────────────
  {
    id: 'bebida-coca',
    category: 'Bebidas',
    name: 'Coca-Cola',
    description: 'Lata gelada.',
    price: 8,
    image: require('../assets/images/bebida-coca.jpg'),
  },
  {
    id: 'bebida-coca-zero',
    category: 'Bebidas',
    name: 'Coca-Cola Zero',
    description: 'Lata gelada, sem açúcar.',
    price: 8,
    image: require('../assets/images/bebida-coca-zero.jpg'),
  },
  {
    id: 'bebida-guarana',
    category: 'Bebidas',
    name: 'Guaraná',
    description: 'Lata gelada.',
    price: 8,
    image: require('../assets/images/bebida-guarana.png'),
  },
  {
    id: 'bebida-agua-sem-gas',
    category: 'Bebidas',
    name: 'Água sem Gás',
    description: 'Garrafa gelada.',
    price: 6,
    image: require('../assets/images/bebida-agua-sem-gas.png'),
  },
  {
    id: 'bebida-agua-com-gas',
    category: 'Bebidas',
    name: 'Água com Gás',
    description: 'Garrafa gelada, com gás.',
    price: 6,
    image: require('../assets/images/bebida-agua-com-gas.jpg'),
  },
  {
    id: 'bebida-suco',
    category: 'Bebidas',
    name: 'Suco da Casa',
    description: 'Pergunte ao atendente sobre os sabores do dia.',
    price: 7,
    image: require('../assets/images/bebida-suco.jpg'),
  },
];

export const TAX_RATE = 0;

export const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; label: string; helper: string }> = [
  { id: 'card',      label: 'Cartão de Crédito ou Débito', helper: 'Aproxime, insira ou deslize no terminal' },
  { id: 'apple-pay', label: 'Apple Pay / Google Pay',      helper: 'Pagamento por aproximação no celular'    },
  { id: 'cash',      label: 'Pagar em Dinheiro',           helper: 'Finalize no balcão de retirada'          },
];

export const TIP_OPTIONS = [0, 10, 15, 20];

export const RECEIPT_OPTIONS: Array<{ id: ReceiptMethod; label: string; helper: string }> = [
  { id: 'none',  label: 'Sem Comprovante',        helper: 'Finalizar sem comprovante'                      },
  { id: 'email', label: 'Comprovante por E-mail', helper: 'Enviar cópia digital para sua caixa de entrada' },
  { id: 'sms',   label: 'Comprovante por SMS',    helper: 'Enviar link por mensagem de texto'              },
  { id: 'print', label: 'Imprimir Comprovante',   helper: 'Imprimir no terminal do restaurante'            },
];
