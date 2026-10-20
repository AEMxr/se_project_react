import "./SkipLink.css";

export default function SkipLink() {
  function handleSkip(event) {
    // Native fragment navigation would replace the production HashRouter route.
    event.preventDefault();
    document.getElementById("main-content")?.focus();
  }

  return (
    <a className="skip-link" href="#main-content" onClick={handleSkip}>
      Skip to main content
    </a>
  );
}
