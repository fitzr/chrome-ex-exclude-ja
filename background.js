'use strict'

const QUERY_EXCLUDE_JA = '&lr=-lang_ja'
const REGEXP_EXCLUDE_JA = /&lr=-lang_ja/
const REGEXP_GOOGLE_SEARCH_URL = /^https?:\/\/www\.google\.(com|co\.jp)\/search\?/

const Icon = {
  DISABLE: "disable.png",
  ENABLE: "enable.png",
  EXCLUDING: "excluding.png"
}

function isGoogle(url) {
  return REGEXP_GOOGLE_SEARCH_URL.test(url)
}

function isExcluding(url) {
  return REGEXP_EXCLUDE_JA.test(url)
}

function setIcon(icon) {
  chrome.browserAction.setIcon({path: icon})
}

function updateIcon(url) {
  if (!isGoogle(url)) {
    setIcon(Icon.DISABLE)
  }
  else if (isExcluding(url)) {
    setIcon(Icon.EXCLUDING)
  }
  else {
    setIcon(Icon.ENABLE)
  }
}

function initIcon() {
  chrome.tabs.getSelected(null, function(tab) {
    updateIcon(tab.url)
  })
}

function activateExcludingJa(tab) {
  chrome.tabs.update(tab.id, {url: tab.url+QUERY_EXCLUDE_JA})
}

function inactivateExcludeJa(tab) {
  chrome.tabs.update(tab.id, {url: tab.url.replace(QUERY_EXCLUDE_JA, '')})
}

function onClickIcon() {
  chrome.tabs.getSelected(null, function(tab) {
    if (isGoogle(tab.url)) {
      if (isExcluding(tab.url)) inactivateExcludeJa(tab)
      else activateExcludingJa(tab)
    }
  })
}

function onChangeTab() {
  chrome.tabs.getSelected(null, function(tab) {
    updateIcon(tab.url)
  })
}

function onChangeUrl(tabId, changeInfo) {
  if(changeInfo.url) {
    updateIcon(changeInfo.url)
  }
}

chrome.tabs.onActivated.addListener(onChangeTab)
chrome.tabs.onUpdated.addListener(onChangeUrl)
chrome.browserAction.onClicked.addListener(onClickIcon)
initIcon()
