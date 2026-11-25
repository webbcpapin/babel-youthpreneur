export const activationDate = '25 November 2026'
export const finalDeadline = Date.parse('2026-12-10T00:00:00+07:00')
export const finalDeadlineLabel = '9 Desember 2026, 23.59 WIB'

export const reportingPeriods = [
  { week: 1, dates: '26–29 November 2026', starts: '2026-11-26' },
  { week: 2, dates: '30 November–4 Desember 2026', starts: '2026-11-30' },
  { week: 3, dates: '5–9 Desember 2026', starts: '2026-12-05' },
] as const

export function reportIsOpen(week: number, now = Date.now()) {
  const period = reportingPeriods.find((item) => item.week === week)
  return !!period && now >= Date.parse(`${period.starts}T00:00:00+07:00`)
}

export function jakartaDate(value = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(value)
}

export function jakartaTimestamp(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}
