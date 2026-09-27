function PageLoader({ fading }) {
  return (
    <div className={`page-loader${fading ? " is-fading" : ""}`} role="status" aria-live="polite">
      <div className="loader-stage">
        <div className="loader-ring" aria-hidden="true" />
        <div className="loader-crests" aria-hidden="true">
          <span className="mini-crest mini-crest-g" />
          <span className="mini-crest mini-crest-s" />
          <span className="mini-crest mini-crest-r" />
          <span className="mini-crest mini-crest-h" />
        </div>
        <p className="loader-logo">Harry Potter | Shop</p>
        <p className="loader-caption">Opening the shop</p>
      </div>
    </div>
  );
}

export default PageLoader;
