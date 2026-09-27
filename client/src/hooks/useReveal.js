import { useEffect } from "react";

function revealIfVisible(node, observer) {
  const rect = node.getBoundingClientRect();
  const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

  if (inView) {
    node.classList.add("is-visible");
    if (observer) observer.unobserve(node);
  }
}

export function useReveal(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;

    const nodes = Array.from(document.querySelectorAll(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    const frame = window.requestAnimationFrame(() => {
      nodes.forEach((node) => {
        revealIfVisible(node);
        observer.observe(node);
      });
    });

    function onScroll() {
      nodes.forEach((node) => {
        if (!node.classList.contains("is-visible")) {
          revealIfVisible(node, observer);
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [enabled]);
}
