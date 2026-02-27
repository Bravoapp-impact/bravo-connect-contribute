/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo link di accesso a Bravo!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Accedi a Bravo!</Heading>
        <Text style={text}>
          Clicca il bottone qui sotto per accedere al tuo account. Il link scadrà tra pochi minuti.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Accedi
          </Button>
        </Section>
        <Text style={hint}>
          Se il bottone non funziona, copia e incolla questo link nel tuo browser:
        </Text>
        <Text style={urlText}>
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Text style={footer}>
          Se non hai richiesto questo link, puoi ignorare questa email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '24px 32px 16px', padding: '0' }
const text = { fontSize: '15px', color: '#737373', lineHeight: '1.6', margin: '0 32px 24px' }
const link = { color: '#8800FF', textDecoration: 'underline' }
const buttonContainer = { textAlign: 'center' as const, margin: '0 32px 24px' }
const button = { backgroundColor: '#8800FF', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const hint = { fontSize: '12px', color: '#999999', margin: '0 32px 8px' }
const urlText = { fontSize: '12px', color: '#999999', margin: '0 32px 24px', wordBreak: 'break-all' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '0 32px 32px', borderTop: '1px solid #e5e5e5', paddingTop: '16px' }
