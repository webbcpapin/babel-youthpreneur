export type MonitoringConfig = {
  appsScriptUrl?: string
  googleOAuthClientId?: string
  sheetId?: string
}

declare global {
  interface Window {
    MONITORING_CONFIG?: MonitoringConfig
    google?: GoogleIdentityGlobal
  }
}

export type GoogleCredentialResponse = {
  credential: string
}

type GoogleIdentityGlobal = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; ux_mode?: 'popup' }) => void
      renderButton: (element: HTMLElement, options: { theme?: 'outline' | 'filled_blue'; size?: 'large' | 'medium' | 'small'; width?: number; text?: 'signin_with' | 'signup_with' | 'continue_with' }) => void
    }
  }
}

export function getMonitoringConfig(): MonitoringConfig {
  return window.MONITORING_CONFIG ?? {}
}

export function getAppsScriptUrl(): string {
  return getMonitoringConfig().appsScriptUrl?.trim() ?? ''
}

export function getGoogleOAuthClientId(): string {
  return getMonitoringConfig().googleOAuthClientId?.trim() || import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID?.trim() || ''
}

export function hasGoogleBackend(): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(getAppsScriptUrl())
}
