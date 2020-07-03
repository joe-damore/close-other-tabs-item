/**
 * Enables or disables the "Close Other Tabs" menu item according to tab state.
 */
const updateItemStatus = async function updateItemStatus() {
  let enabled = true;
  const allTabs = await browser.tabs.query({currentWindow: true});
  if (allTabs.length <= 1) {
    enabled = false;
  }

  browser.contextMenus.update("close_other", {
    enabled,
  });
};

/**
 * Closes all tabs in `all`, except for the tab whose index matches `current`.
 *
 * @param {Object} current - Active tab.
 * @param {Object[]} all - All tabs in current window.
 */
const closeTabs = function closeTabs(current, all) {
  const removedTabIDs = all
    .filter((tab) => {
      return tab.index != current.index;
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

// Recalculate "Close Other Tabs" item status when tabs update.
browser.tabs.onUpdated.addListener(() => {
  updateItemStatus();
});

// Recalculate "Close Other Tabs" item status when tabs move.
browser.tabs.onMoved.addListener(() => {
  updateItemStatus();
});

/**
 * Calls "closeTabs" if the "close_other" context menu item is clicked.
 */
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "close_other") {
    const allTabs = await browser.tabs.query({currentWindow: true});
    closeTabs(tab, allTabs);
  }
});
