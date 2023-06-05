import WithPWA from 'next-pwa'
import cache from './fe/cache.js'
import { withSuperjson } from 'next-superjson'

const withPWA = WithPWA({
  dest: 'public',
  cacheStartUrl: true,
  runtimeCaching: cache,
  // cacheOnFrontEndNav: true,
  register: false,
  disable: process.env.NODE_ENV === 'development',
  // sw: 'sw.js',
})

export default withSuperjson()(withPWA({
  compress: true,
  poweredByHeader: false,
  distDir: 'dist',
  compiler: {
    styledComponents: true
  },
  poweredByHeader: false,
  generateBuildId: async () => {
    // You can, for example, get the latest git commit hash here
    return 'my-build-id'
  },
  trailingSlash: false,
}))