import { useEffect, useState } from "react";
import { heroSlides } from "../data/home.js";

function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[index];

  return (
    <section className={`hero-banner hero-banner-${slide.tone}`} aria-roledescription="carousel">
      <button
        type="button"
        className="hero-arrow hero-arrow-prev"
        aria-label="이전 배너"
        onClick={() => setIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
      >
        ‹
      </button>

      <div key={slide.id} className="hero-copy">
        <p>{slide.kicker}</p>
        <h2>{slide.title}</h2>
        <span>{slide.text}</span>
      </div>

      <button
        type="button"
        className="hero-arrow hero-arrow-next"
        aria-label="다음 배너"
        onClick={() => setIndex((current) => (current + 1) % heroSlides.length)}
      >
        ›
      </button>

      <div className="hero-dots">
        {heroSlides.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            className={itemIndex === index ? "is-active" : ""}
            aria-label={`${itemIndex + 1}번째 배너`}
            onClick={() => setIndex(itemIndex)}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;
