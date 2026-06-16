import { PayOS } from '@payos/node'

const requiredPayosEnvKeys = ['PAYOS_CLIENT_ID', 'PAYOS_API_KEY', 'PAYOS_CHECKSUM_KEY'] as const

export function getPayos() {
  const missingKeys = requiredPayosEnvKeys.filter((key) => !process.env[key])

  if (missingKeys.length > 0) {
    throw new Error(`Missing PayOS environment variables: ${missingKeys.join(', ')}`)
  }

  return new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  })
}
