
export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    readTime: string;
    imageUrl: string;
    category: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Why Temporary Emails are Essential for Online Privacy',
        excerpt: 'In an age of data breaches and spam, discover how disposable email addresses serve as your first line of defense.',
        content: 'Full content would go here...',
        date: 'Jan 4, 2026',
        author: 'Alex Chen',
        readTime: '5 min read',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000',
        category: 'Privacy'
    },
    {
        id: '2',
        title: 'How to Avoid Spam When Signing Up for New Services',
        excerpt: 'Learn the best practices for keeping your primary inbox clean and organized using temporary email solutions.',
        content: 'Full content would go here...',
        date: 'Jan 2, 2026',
        author: 'Sarah Jones',
        readTime: '4 min read',
        imageUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=1000',
        category: 'Tips'
    },
    {
        id: '3',
        title: 'The Tech Behind Disposable Email Addresses',
        excerpt: 'A deep dive into how temporary email systems work, from SMTP handling to real-time socket connections.',
        content: 'Full content would go here...',
        date: 'Dec 28, 2025',
        author: 'David Kumar',
        readTime: '7 min read',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000',
        category: 'Technology'
    },
    {
        id: '4',
        title: 'Top 5 Use Cases for Temp Mail You Didn\'t Know',
        excerpt: 'Beyond just skipping spam, find out how developers, testers, and privacy enthusiasts use temp mail daily.',
        content: 'Full content would go here...',
        date: 'Dec 25, 2025',
        author: 'Emily Wilson',
        readTime: '3 min read',
        imageUrl: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=1000',
        category: 'Guides'
    },
    {
        id: '5',
        title: 'Protecting Your Digital Identity in 2026',
        excerpt: 'Comprehensive strategies to minimize your digital footprint and protect your personal information online.',
        content: 'Full content would go here...',
        date: 'Dec 20, 2025',
        author: 'Michael Brown',
        readTime: '6 min read',
        imageUrl: 'https://images.unsplash.com/photo-1510915361405-ef8a93fa3838?auto=format&fit=crop&q=80&w=1000',
        category: 'Security'
    },
    {
        id: '6',
        title: 'Understanding Email Protocols: SMTP, IMAP, and POP3',
        excerpt: 'A beginner-friendly guide to understanding how email actually works under the hood.',
        content: 'Full content would go here...',
        date: 'Dec 15, 2025',
        author: 'Jessica Lee',
        readTime: '8 min read',
        imageUrl: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=1000',
        category: 'Education'
    }
];
