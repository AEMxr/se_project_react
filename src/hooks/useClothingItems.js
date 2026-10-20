import { useEffect, useRef, useState } from "react";
import {
  getItems,
  createItem,
  removeItem,
  toggleItemLike,
} from "../utils/api.js";
import { createUserError, getErrorMessage } from "../utils/errors.js";
import { mergeInitialItems, normalizeItem } from "../utils/items.js";

export default function useClothingItems({
  authRequestId,
  pendingDeleteId,
  selectedItem,
  setSelectedItem,
  setClothingItems,
  setIsItemsLoading,
  setItemsError,
  assertCurrentSession,
  handleProtectedRequestError,
}) {
  const changedItemIds = useRef(new Set());
  const pendingLikes = useRef(new Map());
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const changedDuringLoad = new Set();
    changedItemIds.current = changedDuringLoad;
    setIsItemsLoading(true);
    setItemsError("");
    getItems({ signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(items)) throw new Error("Invalid clothing response");
        const loaded = items.map(normalizeItem);
        setClothingItems((current) =>
          mergeInitialItems(current, loaded, changedDuringLoad),
        );
      })
      .catch((error) => {
        if (!controller.signal.aborted && error?.name !== "AbortError")
          setItemsError(
            `Clothing items could not be loaded. ${getErrorMessage(error, "Please try again.")}`,
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsItemsLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, [attempt, setClothingItems, setIsItemsLoading, setItemsError]);

  function retryItems() {
    setAttempt((current) => current + 1);
  }

  function handleAddItem(values) {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    return createItem(values, token)
      .then((created) => {
        assertCurrentSession(token, requestId);
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
    const deletion = { id };
    pendingDeleteId.current = deletion;
    return removeItem(id, token)
      .then(() => {
        assertCurrentSession(token, requestId);
        changedItemIds.current.add(id);
        setClothingItems((previous) =>
          previous.filter((item) => item._id !== id),
        );
        setSelectedItem((current) => (current?._id === id ? null : current));
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId))
      .finally(() => {
        if (pendingDeleteId.current === deletion)
          pendingDeleteId.current = null;
      });
  }

  function handleCardLike({ id, isLiked }) {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    const pending = pendingLikes.current.get(id);
    if (pending?.token === token && pending?.requestId === requestId)
      return Promise.reject(
        createUserError("This item is still updating. Please try again."),
      );
    const mutation = { token, requestId };
    pendingLikes.current.set(id, mutation);
    return toggleItemLike(id, isLiked, token)
      .then((updated) => {
        assertCurrentSession(token, requestId);
        changedItemIds.current.add(id);
        setClothingItems((previous) =>
          previous.map((item) =>
            item._id === id ? normalizeItem({ ...item, ...updated }) : item,
          ),
        );
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId))
      .finally(() => {
        if (pendingLikes.current.get(id) === mutation)
          pendingLikes.current.delete(id);
      });
  }

  return { handleAddItem, handleConfirmDelete, handleCardLike, retryItems };
}
