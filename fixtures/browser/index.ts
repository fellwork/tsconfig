export function findApp(): Element | null {
  return document.querySelector('#app')
}

export function listLinkHrefs(): string[] {
  const anchors = document.querySelectorAll('a')
  return Array.from(anchors, (a) => a.href)
}
