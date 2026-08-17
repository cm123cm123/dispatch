import { NextResponse } from 'next/server'

/**
 * STUB: Outlook inbox scanner via Microsoft Graph API.
 *
 * Phase 2 setup steps:
 * 1. IT registers an app in Azure AD with Mail.Read (delegated) permission
 * 2. Complete the OAuth flow to get a refresh token; store in GRAPH_REFRESH_TOKEN env var
 * 3. Exchange refresh token for access token via:
 *    POST https://login.microsoftonline.com/{GRAPH_TENANT_ID}/oauth2/v2.0/token
 * 4. Call GET https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=50&$orderby=receivedDateTime+desc
 * 5. Pass emails + current open tasks to Anthropic API to identify:
 *    - New task requests → insert into tasks table
 *    - Replies on existing threads → append to comms_log
 * 6. Write a row to email_scan_log with the summary
 *
 * Required env vars (add to .env.local and Vercel):
 *   GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_TENANT_ID, GRAPH_REFRESH_TOKEN
 *   ANTHROPIC_API_KEY
 *   SUPABASE_SERVICE_ROLE_KEY (for server-side DB writes without RLS)
 */
export async function POST() {
  return NextResponse.json(
    {
      status: 'stub',
      message: 'Inbox scan not yet configured. See /api/scan-inbox/route.ts for setup steps.',
    },
    { status: 200 }
  )
}
