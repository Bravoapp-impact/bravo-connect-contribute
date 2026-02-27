/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo codice di verifica Bravo!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src="https://cyazgtnjtnyxscfzsasp.supabase.co/storage/v1/object/public/email-assets/bravo-logo.png" alt="Bravo!" height="40" style={logo} />
        </Section>
        <Heading style={h1}>Codice di verifica</Heading>
        <Text style={text}>Usa il codice qui sotto per confermare la tua identità:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Il codice scadrà tra pochi minuti. Se non hai richiesto questo codice, puoi ignorare questa email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '560px', margin: '0 auto' }
const header = { backgroundColor: '#8800FF', padding: '24px 32px', borderRadius: '12px 12px 0 0', textAlign: 'center' as const }
const logo = { margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '24px 32px 16px', padding: '0' }
const text = { fontSize: '15px', color: '#737373', lineHeight: '1.6', margin: '0 32px 24px' }
const codeStyle = { fontFamily: "'Plus Jakarta Sans', Courier, monospace", fontSize: '28px', fontWeight: 'bold' as const, color: '#8800FF', margin: '0 32px 30px', textAlign: 'center' as const, letterSpacing: '4px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 32px 32px', borderTop: '1px solid #e5e5e5', paddingTop: '16px' }
