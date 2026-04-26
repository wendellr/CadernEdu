/**
 * Design tokens — CadernEdu
 * Fonte da verdade: design_assets/landing/CadernEdu Landing.html
 *
 * Importe no tailwind.config.ts:
 *   import { colors, fontFamily, boxShadow, borderRadius } from '@cadernedu/design-system-web'
 */

export const colors = {
  // Marca
  green: {
    DEFAULT: '#1B7B3F',
    deep: '#145E2E',
    soft: '#E6F4EA',
  },
  cyan: {
    DEFAULT: '#0891B2',
    deep: '#0E7490',
  },
  // Acentos
  yellow: '#FBBF24',
  coral: '#FB7185',
  purple: '#A78BFA',
  // Neutros
  bg: {
    DEFAULT: '#FAFAF7',
    alt: '#F2F1EC',
  },
  card: '#FFFFFF',
  fg: {
    DEFAULT: '#1A1A1A',
    dim: '#5C5C57',
    faint: '#8A8A82',
  },
  border: 'rgba(0,0,0,0.08)',
} as const;

export const fontFamily = {
  display: ['Poppins', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
} as const;

export const fontSize = {
  hero: 'clamp(48px, 6vw, 84px)',
  section: 'clamp(36px, 4.2vw, 56px)',
  cardTitle: '24px',
  lead: '19px',
  body: '17px',
  small: '15px',
  eyebrow: '13px',
} as const;

export const boxShadow = {
  sm: '0 2px 8px rgba(0,0,0,0.04)',
  md: '0 8px 24px rgba(0,0,0,0.08)',
  lg: '0 24px 60px rgba(0,0,0,0.14)',
} as const;

export const borderRadius = {
  btn: '10px',
  btnLg: '12px',
  card: '24px',
  pill: '99px',
} as const;

export const container = {
  maxWidth: '1280px',
  paddingX: '32px',
} as const;

export const animation = {
  morph: 'morph 14s ease-in-out infinite',
  float: 'float 8s ease-in-out infinite',
  floatReverse: 'float 10s ease-in-out infinite reverse',
  pulse: 'pulse 2s infinite',
} as const;

export const mascots = {
  lara:  { src: '/mascots/lara.png',  borderColor: '#1B7B3F', persona: 'Aluna' },
  marco: { src: '/mascots/marco.png', borderColor: '#0891B2', persona: 'Aluno' },
  ana:   { src: '/mascots/ana.png',   borderColor: '#A78BFA', persona: 'Professora' },
  ze:    { src: '/mascots/ze.png',    borderColor: '#FB7185', persona: 'Responsável' },
} as const;

export type Mascot = keyof typeof mascots;
