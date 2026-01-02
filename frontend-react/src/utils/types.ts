export interface Email {
    id: string
    sender: string
    senderEmail: string
    subject: string
    preview: string
    content: string
    timestamp: Date
    isRead: boolean
    hasAttachments?: boolean
}

export interface UserState {
    emailAddress: string
    emails: Email[]
    isLoading: boolean
}
