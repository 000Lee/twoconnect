import crypto from 'crypto'

type JwtHeader = {
   alg: 'HS256'
   typ: 'JWT'
}

type SignOptions = {
   expiresInSec?: number
}

export type JwtPayload = Record<string, any>

function base64UrlEncode(input: Buffer | string): string {
   const buff = Buffer.isBuffer(input) ? input : Buffer.from(input)
   return buff.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(input: string): Buffer {
   input = input.replace(/-/g, '+').replace(/_/g, '/')
   const pad = input.length % 4
   if (pad) input += '='.repeat(4 - pad)
   return Buffer.from(input, 'base64')
}

export function signJwt(payload: JwtPayload, secret: string, options: SignOptions = {}): string {
   const header: JwtHeader = { alg: 'HS256', typ: 'JWT' }
   const nowSec = Math.floor(Date.now() / 1000)
   const claims = { iat: nowSec, ...(options.expiresInSec ? { exp: nowSec + options.expiresInSec } : {}), ...payload }
   const headerB64 = base64UrlEncode(JSON.stringify(header))
   const payloadB64 = base64UrlEncode(JSON.stringify(claims))
   const data = `${headerB64}.${payloadB64}`
   const signature = crypto.createHmac('sha256', secret).update(data).digest()
   const sigB64 = base64UrlEncode(signature)
   return `${data}.${sigB64}`
}

export function verifyJwt(token: string, secret: string): { valid: boolean; payload?: JwtPayload; reason?: string } {
   try {
      const [headerB64, payloadB64, sigB64] = token.split('.')
      if (!headerB64 || !payloadB64 || !sigB64) return { valid: false, reason: 'Malformed token' }
      const data = `${headerB64}.${payloadB64}`
      const expected = base64UrlEncode(crypto.createHmac('sha256', secret).update(data).digest())
      if (!crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expected))) return { valid: false, reason: 'Invalid signature' }
      const payloadJson = base64UrlDecode(payloadB64).toString('utf8')
      const payload = JSON.parse(payloadJson)
      if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return { valid: false, reason: 'Token expired' }
      return { valid: true, payload }
   } catch (e: any) {
      return { valid: false, reason: e?.message || 'Verification error' }
   }
}
