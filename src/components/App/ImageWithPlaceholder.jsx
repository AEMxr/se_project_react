import { useEffect, useRef, useState } from "react";
import "./ImageWithPlaceholder.css";

function ImageContent({ src, alt, className = "", loading = "lazy" }) {
  const [status, setStatus] = useState(src ? "loading" : "error");
  const imageRef = useRef(null);
  const isLoaded = status === "loaded";

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete) {
      setStatus(image.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  return (
    <span
      className={`image-placeholder${isLoaded ? "" : " image-placeholder_pending"} ${className}`}
      aria-busy={status === "loading"}
    >
      {src && (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={`image-placeholder__image${isLoaded ? " image-placeholder__image_loaded" : ""}`}
          loading={loading}
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
      {!isLoaded && (
        <span
          className="image-placeholder__message"
          aria-hidden={status === "loading"}
        >
          {status === "loading" ? "Loading image..." : "Image unavailable"}
        </span>
      )}
    </span>
  );
}

export default function ImageWithPlaceholder(props) {
  // A different URL gets its own lifecycle; old image events cannot reveal it.
  return <ImageContent key={props.src} {...props} />;
}
