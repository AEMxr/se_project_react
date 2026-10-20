import { useEffect, useRef } from "react";
import {
  getItems,
  createItem,
  removeItem,
  toggleItemLike,
} from "../utils/api.js";
import { createUserError } from "../utils/errors.js";
import { mergeInitialItems, normalizeItem } from "../utils/items.js";

export default function useClothingItems({
  authRequestId,
  pendingDeleteId,
  selectedItem,
  setSelectedItem,
  setClothingItems,
  setIsItemsLoading,
  setItemsError,
  handleProtectedRequestError,
}) {
  const changedItemIds = useRef(new Set());
  const pendingLikes = useRef(new Set());
  useEffect(() => {
    const controller = new AbortController();
    getItems({ signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(items)) throw new Error("Invalid clothing response");
        const loaded = items.map(normalizeItem);
        setClothingItems((current) =>
          mergeInitialItems(current, loaded, changedItemIds.current),
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted && error?.name !== "AbortError")
          setItemsError(
            "Clothing items could not be loaded. Please try refreshing the page.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsItemsLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, [setClothingItems, setIsItemsLoading, setItemsError]);

  function handleAddItem(values) {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    return createItem(values, token)
      .then((created) => {
        const item = normalizeItem(created);
        changedItemIds.current.add(item._id);
        setClothingItems((previous) => [
          item,
          ...previous.filter((existing) => existing._id !== item._id),
        ]);
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId));
  }

  function handleConfirmDelete() {
    const id = selectedItem?._id;
    if (!id || pendingDeleteId.current)
      return Promise.reject(
        createUserError("This item is already being deleted."),
      );
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    pendingDeleteId.current = id;
    return removeItem(id, token)
      .then(() => {
        changedItemIds.current.add(id);
        setClothingItems((previous) =>
          previous.filter((item) => item._id !== id),
        );
        setSelectedItem((current) => (current?._id === id ? null : current));
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId))
      .finally(() => {
        pendingDeleteId.current = null;
      });
  }

  function handleCardLike({ id, isLiked }) {
    if (pendingLikes.current.has(id))
      return Promise.reject(
        createUserError("This item is still updating. Please try again."),
      );
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    pendingLikes.current.add(id);
    return toggleItemLike(id, isLiked, token)
      .then((updated) => {
        changedItemIds.current.add(id);
        setClothingItems((previous) =>
          previous.map((item) =>
            item._id === id ? normalizeItem({ ...item, ...updated }) : item,
          ),
        );
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId))
      .finally(() => {
        pendingLikes.current.delete(id);
      });
  }

  return { handleAddItem, handleConfirmDelete, handleCardLike };
}
