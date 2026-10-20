import { useEffect, useRef } from "react";
import { signIn, signUp, getCurrentUser } from "../utils/auth.js";
import { updateCurrentUser } from "../utils/api.js";
import { UNAUTHORIZED_STATUS } from "../utils/request.js";
import {
  createAbortError,
  createUserError,
  rejectRequest,
} from "../utils/errors.js";

export default function useAuthentication({
  currentUser,
  authRequestId,
  modalRef,
  setCurrentUser,
  setIsLoggedIn,
  setIsAuthChecking,
  setAuthError,
  setActiveModal,
  setSelectedItem,
}) {
  const profileQueues = useRef(new Map());
  useEffect(
    () => () => {
      authRequestId.current += 1;
    },
    [authRequestId],
  );

  function handleLogout(message = "") {
    authRequestId.current += 1;
    localStorage.removeItem("jwt");
    modalRef.current = "";
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsAuthChecking(false);
    setActiveModal("");
    setSelectedItem(null);
    setAuthError(message);
  }

  function assertCurrentAuthRequest(requestId) {
    if (authRequestId.current !== requestId) throw createAbortError();
  }

  function assertCurrentSession(token, requestId) {
    assertCurrentAuthRequest(requestId);
    if (localStorage.getItem("jwt") !== token) throw createAbortError();
  }

  function handleProtectedRequestError(error, token, requestId) {
    assertCurrentSession(token, requestId);
    if (error?.status === UNAUTHORIZED_STATUS)
      handleLogout("Your session expired. Please log in again.");
    throw error;
  }

  function authenticateUser(values, requestId) {
    return signIn(values)
      .then(({ token }) => {
        assertCurrentAuthRequest(requestId);
        if (typeof token !== "string" || !token)
          throw createUserError("Unable to sign in. Please try again.");
        return getCurrentUser(token).then((user) => {
          assertCurrentAuthRequest(requestId);
          if (!user?._id)
            throw createUserError(
              "Unable to load your profile. Please try again.",
            );
          localStorage.setItem("jwt", token);
          setCurrentUser(user);
          setIsLoggedIn(true);
          setIsAuthChecking(false);
          setAuthError("");
        });
      })
      .catch(rejectRequest);
  }

  function handleRegisterModal(values) {
    const requestId = ++authRequestId.current;
    return signUp(values)
      .then(() => {
        assertCurrentAuthRequest(requestId);
        return authenticateUser(values, requestId);
      })
      .catch(rejectRequest);
  }

  function handleLoginModal(values) {
    const requestId = ++authRequestId.current;
    return authenticateUser(values, requestId).catch(rejectRequest);
  }

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    const controller = new AbortController();
    if (!token) {
      setIsAuthChecking(false);
      return () => {
        controller.abort();
      };
    }

    getCurrentUser(token, { signal: controller.signal })
      .then((user) => {
        if (
          controller.signal.aborted ||
          authRequestId.current !== requestId ||
          localStorage.getItem("jwt") !== token
        )
          return;
        if (!user?._id) throw new Error("Invalid profile response");
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch((error) => {
        if (
          controller.signal.aborted ||
          error?.name === "AbortError" ||
          authRequestId.current !== requestId ||
          localStorage.getItem("jwt") !== token
        )
          return;
        if (error?.status === UNAUTHORIZED_STATUS)
          localStorage.removeItem("jwt");
        else
          setAuthError(
            "Your session could not be verified. Please try logging in again.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsAuthChecking(false);
      });

    return () => {
      controller.abort();
    };
  }, [
    authRequestId,
    setCurrentUser,
    setIsLoggedIn,
    setIsAuthChecking,
    setAuthError,
  ]);

  function handleUpdateProfile(values) {
    const token = localStorage.getItem("jwt");
    const requestId = authRequestId.current;
    const userId = currentUser?._id;
    if (!token || !userId) {
      handleLogout("Please log in before updating your profile.");
      return Promise.reject(createAbortError());
    }

    // Finish each user's saves in order, including saves from a reopened form.
    const previous = profileQueues.current.get(userId) ?? Promise.resolve();
    const request = previous
      .catch(() => undefined)
      .then(() => {
        assertCurrentSession(token, requestId);
        return updateCurrentUser(values, token);
      })
      .then((user) => {
        assertCurrentSession(token, requestId);
        setCurrentUser(user);
      })
      .catch((error) => handleProtectedRequestError(error, token, requestId));
    profileQueues.current.set(userId, request);
    return request.finally(() => {
      if (profileQueues.current.get(userId) === request)
        profileQueues.current.delete(userId);
    });
  }

  return {
    handleLogout,
    handleRegisterModal,
    handleLoginModal,
    handleUpdateProfile,
    assertCurrentSession,
    handleProtectedRequestError,
  };
}
