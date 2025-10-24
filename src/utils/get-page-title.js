import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Dast-xray-web'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
