// ============================================
// CLOUDFLARE WORKER API INTEGRATION
// Example endpoints for Teleflix Temp Mail
// ============================================

/**
 * This file shows how to integrate the new UI with your existing
 * Cloudflare Worker backend. Add these modifications to your worker.ts
 */

// ============================================
// 1. UPDATE app.js TO USE YOUR API
// ============================================

/*
In frontend-vanilla/app.js, update the fetchEmails() method:
*/

async fetchEmails() {
    try {
        // Get the email address (already extracted from this.currentEmail)
        const emailAddress = encodeURIComponent(this.currentEmail);

        // Option 1: If you're using JWT tokens
        const jwt = localStorage.getItem('teleflix_jwt');
        const headers = jwt ? { 'Authorization': `Bearer ${jwt}` } : {};

        // Option 2: Basic fetch without auth
        const response = await fetch(`/api/mails/${emailAddress}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform the response to match our UI format
        return this.transformEmails(data);

    } catch (error) {
        console.error('Error fetching emails:', error);

        // Development mode: return mock data
        if (window.location.hostname === 'localhost') {
            return this.getMockEmails();
        }

        return [];
    }
}

// ============================================
// 2. TRANSFORM WORKER RESPONSE
// ============================================

/*
Add this method to the TeleflixTempMail class in app.js
to transform your Worker's response format to match the UI
*/

transformEmails(workerData) {
    // Assuming worker returns: { results: [...], count: number }
    const emails = workerData.results || workerData.emails || [];

    return emails.map((email, index) => ({
        id: email.id || index,
        from: email.from || email.sender || 'unknown@sender.com',
        subject: email.subject || '(No Subject)',
        preview: this.generatePreview(email),
        date: new Date(email.created || email.date || Date.now()),
        html: email.raw || email.html || email.body_html,
        body: email.text || email.body_plain || this.stripHtml(email.html || '')
    }));
}

generatePreview(email) {
    // Extract first 150 chars of text content
    const text = email.text || email.body_plain || this.stripHtml(email.html || email.raw || '');
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
}

stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// ============================================
// 3. GENERATE EMAIL ADDRESS
// ============================================

/*
Update generateEmail() method if you want to use server-side generation
*/

async generateEmail() {
    // First check for stored email
    const storedEmail = localStorage.getItem('teleflix_email');
    const storedJWT = localStorage.getItem('teleflix_jwt');

    if (storedEmail && storedJWT) {
        this.currentEmail = storedEmail;
        this.displayEmail();
        this.checkMail();
        return;
    }

    // Generate new email via API
    try {
        const response = await fetch('/api/new_address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: this.generateUsername() // Use our random username
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate email');
        }

        const data = await response.json();

        this.currentEmail = data.address || data.email;
        localStorage.setItem('teleflix_email', this.currentEmail);

        // Store JWT if provided
        if (data.jwt) {
            localStorage.setItem('teleflix_jwt', data.jwt);
        }

        this.displayEmail();
        this.checkMail();

    } catch (error) {
        console.error('Error generating email:', error);

        // Fallback to client-side generation
        const username = this.generateUsername();
        const domain = this.getDomain();
        this.currentEmail = `${username}@${domain}`;
        localStorage.setItem('teleflix_email', this.currentEmail);
        this.displayEmail();
        this.checkMail();
    }
}

// ============================================
// 4. WORKER ENDPOINT EXAMPLES
// ============================================

/*
If you need to add/modify endpoints in your Worker (worker/src/worker.ts),
here are examples that work with the new UI:
*/

// Example: Get emails for an address
router.get('/api/mails/:address', async (request, env) => {
    const address = request.params.address;

    // Your existing logic to fetch emails from D1
    const emails = await env.DB.prepare(
        'SELECT * FROM emails WHERE address = ? ORDER BY created DESC LIMIT 50'
    ).bind(address).all();

    return new Response(JSON.stringify({
        success: true,
        count: emails.results.length,
        emails: emails.results
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

// Example: Generate new address
router.post('/api/new_address', async (request, env) => {
    const body = await request.json();
    const username = body.name || generateRandomUsername();

    // Your existing logic to create address
    const address = `${username}@${env.DOMAIN}`;
    const jwt = await generateJWT(address, env);

    return new Response(JSON.stringify({
        success: true,
        address: address,
        jwt: jwt
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

// ============================================
// 5. ENABLE CORS FOR YOUR WORKER
// ============================================

/*
Add CORS headers to your Worker responses.
In worker/src/worker.ts, add this middleware:
*/

function addCorsHeaders(response) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}

// Handle OPTIONS requests for CORS preflight
if (request.method === 'OPTIONS') {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}

// ============================================
// 6. WEBSOCKET FOR REAL-TIME UPDATES (OPTIONAL)
// ============================================

/*
For instant email notifications instead of polling,
you can add WebSocket support:
*/

// In app.js
connectWebSocket() {
    const ws = new WebSocket(`wss://${window.location.host}/ws`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({
            type: 'subscribe',
            address: this.currentEmail
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_email') {
            // Add new email to the list
            this.emails.unshift(data.email);
            this.renderEmails();
            this.updateStatus(`${this.emails.length} emails`, 'success');
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Fall back to polling
        this.startPolling();
    };
}

// In worker.ts
async handleWebSocket(request, env) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();

    // Handle WebSocket messages
    server.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'subscribe') {
            // Store subscription in Durable Object or KV
            // Send new emails when they arrive
        }
    });

    return new Response(null, {
        status: 101,
        webSocket: client
    });
}

// ============================================
// 7. DEPLOYMENT CHECKLIST
// ============================================

/*
Before deploying your new UI:

1. ✅ Update API endpoints in app.js
2. ✅ Test locally with mock data
3. ✅ Verify CORS headers in Worker
4. ✅ Check JWT authentication if used
5. ✅ Test on mobile devices
6. ✅ Verify email display in modal
7. ✅ Test copy to clipboard
8. ✅ Check polling interval
9. ✅ Deploy to Cloudflare Pages
10. ✅ Link Pages with Worker binding

Deployment command:
wrangler pages deploy frontend-vanilla --project-name teleflix-mail

*/

// ============================================
// 8. EXAMPLE: Complete API Integration
// ============================================

/*
Here's a complete example of app.js with full Worker integration:
*/

class TeleflixTempMail {
    constructor() {
        this.currentEmail = '';
        this.emails = [];
        this.polling = null;
        this.pollingInterval = 5000;
        this.apiBase = '/api'; // Change to your Worker URL in production

        this.init();
    }

    async fetchEmails() {
        try {
            const response = await fetch(`${this.apiBase}/mails/${encodeURIComponent(this.currentEmail)}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            return this.transformWorkerEmails(data.emails || data.results || []);

        } catch (error) {
            console.error('API Error:', error);
            return window.location.hostname === 'localhost' ? this.getMockEmails() : [];
        }
    }

    getAuthHeaders() {
        const jwt = localStorage.getItem('teleflix_jwt');
        return jwt ? { 'Authorization': `Bearer ${jwt}` } : {};
    }

    transformWorkerEmails(workerEmails) {
        return workerEmails.map(email => ({
            id: email.id,
            from: email.from || email.sender,
            subject: email.subject || '(No Subject)',
            preview: email.text?.substring(0, 150) || '',
            date: new Date(email.created || email.date),
            html: email.raw || email.html,
            body: email.text || email.body_plain
        }));
    }
}

// ============================================
// 9. TESTING YOUR INTEGRATION
// ============================================

/*
Test checklist:

1. Email Generation:
   - Open browser console
   - Check for successful POST to /api/new_address
   - Verify email is displayed and stored in localStorage

2. Email Fetching:
   - Send test email to generated address
   - Wait for polling or manual refresh
   - Check GET request to /api/mails/:address
   - Verify emails appear in inbox

3. Email Viewing:
   - Click on email item
   - Modal should open with full content
   - HTML emails should display correctly in iframe

4. Error Handling:
   - Disconnect from network
   - Verify error messages appear
   - Check fallback to mock data in dev mode

Console debugging:
console.log('Current email:', window.teleflixApp.currentEmail);
console.log('Emails:', window.teleflixApp.emails);
console.log('JWT:', localStorage.getItem('teleflix_jwt'));
*/

export default {
    // This file is for documentation only
    // Copy the relevant sections into your actual code files
};
