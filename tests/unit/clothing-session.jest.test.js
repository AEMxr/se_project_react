/** @jest-environment jsdom */
import { describe, expect, test } from "@jest/globals";
import { useState } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import useAuthentication from "../../src/hooks/useAuthentication.js";
import useClothingItems from "../../src/hooks/useClothingItems.js";
import { deferred, fixture, response } from "../fixtures/api.js";

async function start() {
  const api = fixture();
  fetch.mockImplementation(api.fetch);
  localStorage.setItem("jwt", "token:account-a");
  const authRequestId = { current: 0 };
  const pendingDeleteId = { current: null };
  const modalRef = { current: "" };
  const view = renderHook(() => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [, setIsAuthChecking] = useState(true);
    const [, setAuthError] = useState("");
    const [, setActiveModal] = useState("");
    const [selectedItem, setSelectedItem] = useState(api.db.items[0]);
    const [items, setClothingItems] = useState([]);
    const [, setIsItemsLoading] = useState(true);
    const [, setItemsError] = useState("");
    const auth = useAuthentication({
      currentUser,
      authRequestId,
      pendingDeleteId,
      modalRef,
      setCurrentUser,
      setIsLoggedIn,
      setIsAuthChecking,
      setAuthError,
      setActiveModal,
      setSelectedItem,
    });
    const wardrobe = useClothingItems({
      authRequestId,
      pendingDeleteId,
      selectedItem,
      setSelectedItem,
      setClothingItems,
      setIsItemsLoading,
      setItemsError,
      assertCurrentSession: auth.assertCurrentSession,
      handleProtectedRequestError: auth.handleProtectedRequestError,
    });
    return {
      ...auth,
      ...wardrobe,
      items,
      selectedItem,
      setSelectedItem,
      currentUser,
      isLoggedIn,
    };
  });
  await waitFor(() => {
    expect(view.result.current.currentUser?._id).toBe("account-a");
    expect(view.result.current.items).toHaveLength(3);
  });
  return { ...view, api };
}

async function changeAccount(result) {
  act(() => result.current.handleLogout());
  await act(async () => {
    await result.current.handleLoginModal({
      email: "b@example.com",
      password: "Password1!",
    });
  });
}

function capture(promise) {
  return promise.then(
    () => null,
    (error) => error,
  );
}

const operations = {
  create: (actions) =>
    actions.handleAddItem({
      name: "Old sweater",
      image: "https://example.com/old.jpg",
      weather: "warm",
    }),
  like: (actions) => actions.handleCardLike({ id: "a-warm", isLiked: false }),
  delete: (actions) => actions.handleConfirmDelete(),
};

describe("Clothing mutations belong to the session that started them", () => {
  test.each(
    Object.keys(operations).flatMap((operation) =>
      ["logout", "account switch", "token replacement"].map((change) => [
        operation,
        change,
      ]),
    ),
  )("ignores late %s success after %s", async (operation, change) => {
    const { api, result } = await start();
    const held = deferred();
    api.intercept((call) =>
      call.path.startsWith("/items") && call.method !== "GET"
        ? held.promise
        : undefined,
    );
    const originalItems = structuredClone(result.current.items);
    const pending = capture(operations[operation](result.current));
    if (change === "account switch") await changeAccount(result);
    else if (change === "logout") act(() => result.current.handleLogout());
    else localStorage.setItem("jwt", "token:account-b");
    act(() => result.current.setSelectedItem(api.db.items[1]));
    await act(async () => {
      held.resolve(
        response({
          ...api.db.items[0],
          _id: operation === "create" ? "old-created" : "a-warm",
          likes: ["account-a"],
        }),
      );
      expect(await pending).toMatchObject({ name: "AbortError" });
    });
    expect(result.current.items).toEqual(originalItems);
    expect(result.current.selectedItem._id).toBe("b-warm");
  });

  test("an old like cannot block a new account or release its pending like", async () => {
    const { api, result } = await start();
    const old = deferred();
    const current = deferred();
    api.intercept((call) =>
      call.path.endsWith("/likes")
        ? call.headers.Authorization === "Bearer token:account-a"
          ? old.promise
          : current.promise
        : undefined,
    );
    const first = capture(operations.like(result.current));
    await changeAccount(result);
    const second = capture(operations.like(result.current));
    await act(async () => {
      old.resolve(response({ ...api.db.items[0], likes: ["account-a"] }));
      expect(await first).toMatchObject({ name: "AbortError" });
    });
    expect(
      api.calls.filter((call) => call.path.endsWith("/likes")),
    ).toHaveLength(2);
    expect(await capture(operations.like(result.current))).toMatchObject({
      userMessage: expect.stringContaining("still updating"),
    });
    await act(async () => {
      current.resolve(response({ ...api.db.items[0], likes: ["account-b"] }));
      expect(await second).toBeNull();
    });
    expect(
      result.current.items.find((item) => item._id === "a-warm").likes,
    ).toEqual(["account-b"]);
  });

  test("logout releases an old delete without letting its completion release a newer delete", async () => {
    const { api, result } = await start();
    const old = deferred();
    const current = deferred();
    api.intercept((call) =>
      call.method === "DELETE"
        ? call.path === "/items/a-warm"
          ? old.promise
          : current.promise
        : undefined,
    );
    const first = capture(operations.delete(result.current));
    await changeAccount(result);
    act(() => result.current.setSelectedItem(api.db.items[1]));
    const second = capture(operations.delete(result.current));
    await act(async () => {
      old.resolve(response({}));
      expect(await first).toMatchObject({ name: "AbortError" });
    });
    expect(await capture(operations.delete(result.current))).toMatchObject({
      userMessage: expect.stringContaining("already being deleted"),
    });
    await act(async () => {
      current.resolve(response({}));
      expect(await second).toBeNull();
    });
    expect(result.current.items.map((item) => item._id)).toEqual([
      "a-warm",
      "a-cold",
    ]);
    expect(result.current.selectedItem).toBeNull();
  });
});
