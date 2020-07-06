const MENU_ITEM_ID = "close_other";

/**
 * Enables or disables the "Close Other Tabs" menu item according to tab state.
 */
const updateItemStatus = async function updateItemStatus() {
  let enabled = true;
  const allTabs = await browser.tabs.query({currentWindow: true});

  /*
   * TODO Improve logic so that "Close Other Tabs" item is disabled when all
   * other tabs are pinned.
   */
  if (allTabs.length <= 1) {
    enabled = false;
  }

  browser.contextMenus.update(MENU_ITEM_ID, {
    enabled,
  });

  browser.contextMenus.refresh();
};

/**
 * Closes all tabs in `all`, except for the tab whose index matches `selected`.
 *
 * @param {Object} selected - Tab from which context menu was opened.
 * @param {Object[]} all - All tabs in current window.
 */
const closeTabs = function closeTabs(selected, all) {
  const removedTabIDs = all
    .filter((tab) => {
      return tab.index != selected.index;
    })
    .filter((tab) => {
      return !tab.pinned;
    })
    .map((tab) => {
      return tab.id;
    });

  browser.tabs.remove(removedTabIDs);
};

const item = browser.contextMenus.create({
  id: "close_other",
  title: browser.i18n.getMessage("menuItemTitle"),
  contexts: ["tab"],
}, () => {
  if (browser.runtime.lastError) {
    console.error(browser.runtime.lastError);
  }
});

// Recalculate "Close Other Tabs" item status when context menu is shown.
browser.contextMenus.onShown.addListener(async (info, tab) => {
  updateItemStatus(tab);
});

/**
 * Calls "closeTabs" if the MENU_ITEM_ID context menu item is clicked.
 *
 * @param {Object} info - Clicked menu item info.
 * @param {Object} tab - Tab that was clicked.
 */
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === MENU_ITEM_ID) {
    const allTabs = await browser.tabs.query({currentWindow: true});
    closeTabs(tab, allTabs);
  }
});
