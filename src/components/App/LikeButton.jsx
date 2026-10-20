import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";
import { getErrorMessage } from "../../utils/errors.js";
import "./Main/ItemCard.css";

export default function LikeButton({ item, onCardLike }) {
  const user = useContext(CurrentUserContext);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pending = useRef(false);
  const mounted = useRef(false);
  const userId = useRef(user?._id);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    userId.current = user?._id;
    setErrorMessage("");
  }, [user?._id]);
  if (!user) return null;
  const isLiked = (item.likes ?? []).includes(user._id);

  function handleLike(event) {
    event.stopPropagation();
    if (pending.current) return;
    const owner = user._id;
    pending.current = true;
    setIsPending(true);
    setErrorMessage("");
    Promise.resolve()
      .then(() => onCardLike({ id: item._id, isLiked }))
      .catch((error) => {
        if (
          mounted.current &&
          userId.current === owner &&
          error?.name !== "AbortError"
        )
          setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        pending.current = false;
        if (mounted.current) setIsPending(false);
      });
  }
  return (
    <>
      <button
        className={`card__like interactive${isLiked ? " card__like_active" : ""}`}
        type="button"
        onClick={handleLike}
        disabled={isPending}
        aria-label={`${isLiked ? "Unlike" : "Like"} ${item.name}`}
        aria-pressed={isLiked}
      >
        <span aria-hidden="true">{isLiked ? "♥" : "♡"}</span>
      </button>
      {errorMessage && (
        <span className="card__like-error" role="alert">
          {errorMessage}
        </span>
      )}
    </>
  );
}
