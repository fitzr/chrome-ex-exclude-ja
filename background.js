
const EXCLUDE_JA = '&gl=us&hl=en'
const REGEXP_EXCLUDE_JA = /&?gl=us&hl=en/
const REGEXP_POSITION = /&start=[0-9]+/
const REGEXP_HASHTAG = /#.*$/
const REGEXP_GOOGLE_SEARCH_URL = /^https?:\/\/www\.google\.(com|co\.jp)\/search\?/

const Icon = {
  DISABLE: "images/disable.png",
  ENABLE: "images/enable.png",
  EXCLUDING: "images/icon48.png"
}

const isGoogle = url => REGEXP_GOOGLE_SEARCH_URL.test(url)

const isExcluding = url => REGEXP_EXCLUDE_JA.test(url)

const setIcon = icon => chrome.action.setIcon({path: icon})

const updateIcon = url => {
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

const currentTab = fn => {
  chrome.windows.getCurrent( w => {
    chrome.tabs.query({
      active: true,
      windowId: w.id
    }, tabs => {
      fn(tabs[0])
    })
  })
}

const initIcon = () => {
  currentTab(tab => updateIcon(tab.url))
}

const activateExcludeJa = tab => {
  chrome.tabs.update(tab.id, {
    url: tab.url.replace(REGEXP_HASHTAG, '').replace(REGEXP_POSITION, '') + EXCLUDE_JA
  })
}

const inactivateExcludeJa = tab => {
  chrome.tabs.update(tab.id, {
    url: tab.url.replace(REGEXP_POSITION, '').replace(REGEXP_EXCLUDE_JA, '')
  })
}

const onClickIcon = () => {
  currentTab(tab => {
    if (!isGoogle(tab.url)) {
      // NOP
    }
    else if (isExcluding(tab.url)) {
      inactivateExcludeJa(tab)
    }
    else {
      activateExcludeJa(tab)
    }
  })
}

const onChangeUrl = (tabId, changeInfo) => {
  if(changeInfo.url) {
    updateIcon(changeInfo.url)
  }
}

chrome.tabs.onActivated.addListener(initIcon)
chrome.tabs.onUpdated.addListener(onChangeUrl)
chrome.action.onClicked.addListener(onClickIcon)
initIcon()
