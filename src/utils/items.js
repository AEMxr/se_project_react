export function normalizeItem(item) {
  return {
    ...item,
    link: item.imageUrl || item.link,
    weather: (item.weather || "any").toLowerCase(),
  };
}

export function mergeInitialItems(currentItems, loadedItems, changedIds) {
  const savedItems = new Map();
  for (const item of currentItems) {
    if (changedIds.has(item._id)) savedItems.set(item._id, item);
  }
  for (const item of loadedItems) {
    if (!changedIds.has(item._id)) savedItems.set(item._id, item);
  }
  return [...savedItems.values()];
}
