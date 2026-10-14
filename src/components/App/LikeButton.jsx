import { useContext, useState } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext.js";

export default function LikeButton({ item, onCardLike }) {
  const currentUser = useContext(CurrentUserContext);
  const [isLikePending, setIsLikePending] = useState(false);

  if (!currentUser) {
    return null;
  }

  const isLiked = (item.likes ?? []).includes(currentUser._id);

  function handleLike(event) {
    event.stopPropagation();

    if (isLikePending) {
      return;
    }

    setIsLikePending(true);

    onCardLike({ id: item._id, isLiked })
      .catch(console.error)
      .finally(() => {
        setIsLikePending(false);
      });
  }

  let buttonText = "♡";
  let buttonClassName = "card__like";

  if (isLiked) {
    buttonText = "♥";
    buttonClassName += " card__like--active";
  }

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleLike}
      disabled={isLikePending}
      aria-label={`Like ${item.name}`}
      aria-pressed={isLiked}
    >
      {buttonText}
    </button>
  );
}