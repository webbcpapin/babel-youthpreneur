const form = document.querySelector('#kurasiForm')
const message = document.querySelector('#formMessage')
const submitButton = document.querySelector('#submitButton')
const saveDraftButton = document.querySelector('#saveDraft')
const draftKey = 'babel-youthpreneur-kurasi-draft'
const config = window.KURASI_CONFIG || {}

const multiFields = [
  'legalitas',
  'kanal_penjualan',
  'produk_pembiayaan',
  'kebutuhan_pendampingan',
  'output_program',
]

function setMessage(text, type = 'info') {
  message.textContent = text
  message.className = `message show ${type === 'error' ? 'error' : ''}`
  message.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function updateBackendStatus() {
  const hasEndpoint = Boolean(config.appsScriptUrl && !config.appsScriptUrl.includes('PASTE_'))
  submitButton.disabled = !hasEndpoint
}

function collectFormData() {
  const data = {}
  const formData = new FormData(form)

  for (const [key, value] of formData.entries()) {
    if (!multiFields.includes(key)) {
      data[key] = value
    }
  }

  multiFields.forEach((key) => {
    data[key] = formData.getAll(key)
  })

  if (typeof data.link_marketplace === 'string') {
    data.link_marketplace = data.link_marketplace
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean)
  }

  data.user_agent = navigator.userAgent
  data.source_url = window.location.href
  data.sheet_id = config.sheetId || ''

  return data
}

function saveDraft() {
  localStorage.setItem(draftKey, JSON.stringify(collectFormData()))
  setMessage('Draft tersimpan di browser ini. Data belum dikirim ke Google Sheet.', 'info')
}

function restoreDraft() {
  const raw = localStorage.getItem(draftKey)
  if (!raw) return

  try {
    const data = JSON.parse(raw)
    Object.entries(data).forEach(([key, value]) => {
      if (multiFields.includes(key) && Array.isArray(value)) {
        value.forEach((item) => {
          const checkbox = form.querySelector(`[name="${key}"][value="${CSS.escape(item)}"]`)
          if (checkbox) checkbox.checked = true
        })
        return
      }

      const field = form.elements[key]
      if (key === 'link_marketplace' && Array.isArray(data.link_marketplace)) {
        if (!field) return
        field.value = data.link_marketplace.join('\n')
        return
      }

      if (!field || typeof value !== 'string') return

      if (field instanceof RadioNodeList) {
        field.value = value
      } else {
        field.value = value
      }
    })
  } catch {
    localStorage.removeItem(draftKey)
  }
}

async function submitToSheet(payload) {
  await fetch(config.appsScriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  })
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (!form.reportValidity()) return
  if (!config.appsScriptUrl) {
    setMessage('Endpoint Google Sheet belum dikonfigurasi. Isi URL Apps Script Web App di public/kurasi/config.js.', 'error')
    return
  }

  const payload = collectFormData()

  submitButton.disabled = true
  submitButton.textContent = 'Mengirim...'

  try {
    await submitToSheet(payload)
    localStorage.removeItem(draftKey)
    form.reset()
    setMessage('Data berhasil dikirim. Jika koneksi Google Sheet sudah benar, baris baru akan muncul di sheet "Kurasi UMKM 2026".', 'info')
  } catch (error) {
    setMessage(`Gagal mengirim data: ${error.message || error}. Draft disimpan di browser ini.`, 'error')
    localStorage.setItem(draftKey, JSON.stringify(payload))
  } finally {
    submitButton.disabled = false
    submitButton.textContent = 'Submit'
    updateBackendStatus()
  }
})

saveDraftButton.addEventListener('click', saveDraft)

restoreDraft()
updateBackendStatus()
