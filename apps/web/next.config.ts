import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Docker exit plan (ADR-012).
  output: 'standalone',
}

export default withPayload(nextConfig)
