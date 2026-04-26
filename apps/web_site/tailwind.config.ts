import type { Config } from 'tailwindcss'
import { colors, fontFamily, boxShadow, borderRadius } from '../../packages/design_system_web/src/tokens'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: [...fontFamily.display],
        sans: [...fontFamily.sans],
        mono: [...fontFamily.mono],
      },
      boxShadow,
      borderRadius,
    },
  },
  plugins: [],
}

export default config
