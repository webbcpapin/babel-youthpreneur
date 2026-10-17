const GOOGLE_SCRIPT_ID = 'google-identity-services'
let pending: Promise<void> | undefined

export function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve()
  if (pending) return pending

  pending = new Promise<void>((resolve, reject) => {
    const script = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
      ?? document.createElement('script')
    const timeout = window.setTimeout(() => finish(new Error('Tombol Google belum dapat dimuat. Periksa koneksi lalu coba lagi.')), 15_000)

    function finish(error?: Error) {
      window.clearTimeout(timeout)
      script.removeEventListener('load', onLoad)
      script.removeEventListener('error', onError)
      if (error) {
        script.remove()
        reject(error)
      } else {
        resolve()
      }
    }

    function onLoad() {
      finish(window.google?.accounts.id ? undefined : new Error('Layanan login Google tidak tersedia. Coba lagi.'))
    }

    function onError() {
      finish(new Error('Tombol Google tidak dapat dimuat. Periksa koneksi lalu coba lagi.'))
    }

    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })
    if (!script.isConnected) {
      script.id = GOOGLE_SCRIPT_ID
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }).catch((error: unknown) => {
    pending = undefined
    throw error
  })
  return pending
}
