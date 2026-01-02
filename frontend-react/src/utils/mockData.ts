import { Email } from './types'

const DOMAINS = ['tempmail.co', 'quickinbox.net', 'ghostmail.io']
const NAMES = [
    'Alex',
    'Sarah',
    'Support',
    'Newsletter',
    'Security',
    'GitHub',
    'Linear',
    'Vercel',
]
const SUBJECTS = [
    'Verify your email address',
    'Welcome to the platform!',
    'Your login code is 123456',
    'New sign-in detected',
    'Weekly digest: Top stories',
    'Invoice #4023 for your recent purchase',
    'Reset your password',
]

export const generateRandomEmailAddress = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let user = ''
    for (let i = 0; i < 10; i++) {
        user += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)]
    return `${user}@${domain}`
}

export const generateMockEmail = (): Email => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)]
    const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]

    return {
        id: Math.random().toString(36).substr(2, 9),
        sender: name,
        senderEmail: `${name.toLowerCase()}@example.com`,
        subject: subject,
        preview: `Hi there, this is a test email regarding ${subject.toLowerCase()}...`,
        content: `
      <div style="font-family: sans-serif;">
        <h2>${subject}</h2>
        <p>Hello,</p>
        <p>This is a simulated email for your temporary inbox. We just wanted to let you know that everything is working perfectly.</p>
        <p>Here are some details:</p>
        <ul>
          <li>Time: ${new Date().toLocaleTimeString()}</li>
          <li>ID: ${Math.random().toString(36).substr(2, 9)}</li>
        </ul>
        <br/>
        <p>Best regards,<br/>The ${name} Team</p>
        <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; color: #666;">
          <small>This is an automated message. Please do not reply.</small>
        </div>
      </div>
    `,
        timestamp: new Date(),
        isRead: false,
        hasAttachments: Math.random() > 0.8,
    }
}
