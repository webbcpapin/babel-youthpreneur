export async function encodeWeeklyPhoto(file: File) {
  if (!file.type.startsWith('image/') || file.size > 20_000_000) {
    throw new Error('Pilih foto berukuran maksimal 20 MB.')
  }
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) throw new Error('Foto tidak dapat diproses.')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const jpeg = canvas.toDataURL('image/jpeg', 0.76)
    if (!jpeg.startsWith('data:image/jpeg;base64,') || jpeg.length > 1_398_125) {
      throw new Error('Foto terlalu besar. Pilih foto lain atau tempel tautan bukti.')
    }
    return jpeg.split(',')[1]
  } finally {
    URL.revokeObjectURL(url)
  }
}
