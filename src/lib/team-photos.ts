const photoSlugs: Record<string, string> = {
  'byp26-unmuh-1': 'lokalink',
  'byp26-unmuh-2': 'truntum',
  'byp26-iain-1': 'hanrevel',
  'byp26-iain-2': 'sasflo',
  'byp26-pertiba-1': 'go-green',
  'byp26-pertiba-2': 'benang-merah',
  'byp26-unaba-1': 'floratrace',
  'byp26-unaba-2': 'digiscoral',
  'byp26-ubb-1': 'wastra-serumpun',
  'byp26-ubb-2': 'the-sandau',
}

export function getTeamPhoto(teamId: string): string | undefined {
  return Object.hasOwn(photoSlugs, teamId)
    ? `${import.meta.env.BASE_URL}images/teams-2026/${photoSlugs[teamId]}.webp`
    : undefined
}
