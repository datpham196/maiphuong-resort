import type { PublicExperience } from "@/services/experiences";
import { ExperienceGallerySlider } from "@/components/experiences/experience-gallery-slider";
import { formatExperiencePrice, splitContentLines } from "@/components/experiences/experience-media";

type Props = {
  item: PublicExperience;
  locale: string;
  groupLabel: string;
  labels: {
    overview: string;
    itinerary: string;
    duration: string;
    price: string;
  };
};

export function ExperienceLayout2({ item, locale, groupLabel, labels }: Props) {
  const price = formatExperiencePrice(item, locale);
  const steps = splitContentLines(item.itinerary);

  return (
    <article className="experience-layout experience-layout-2">
      <ExperienceGallerySlider item={item} groupLabel={groupLabel} />

      <div className="experience-detail-body">
        {(item.durationText || price) && (
          <section className="experience-facts" aria-label={labels.overview}>
            {item.durationText ? (
              <div className="experience-fact">
                <p className="experience-fact-label">{labels.duration}</p>
                <p className="experience-fact-value">{item.durationText}</p>
              </div>
            ) : null}
            {price ? (
              <div className="experience-fact is-price">
                <p className="experience-fact-label">{labels.price}</p>
                <p className="experience-fact-value">{price}</p>
                {item.priceNote ? <p className="experience-fact-note">{item.priceNote}</p> : null}
              </div>
            ) : null}
          </section>
        )}

        {steps.length > 0 ? (
          <section className="experience-section" aria-label={labels.itinerary}>
            <header className="experience-section-head">
              <p className="eyebrow">{labels.itinerary}</p>
              <h2>{labels.itinerary}</h2>
            </header>
            <ol className="experience-timeline">
              {steps.map((step, index) => (
                <li key={`${index}-${step.slice(0, 24)}`}>
                  <span className="experience-timeline-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="experience-timeline-step">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {item.description ? (
          <section className="experience-section" aria-label={labels.overview}>
            <header className="experience-section-head">
              <p className="eyebrow">{labels.overview}</p>
              <h2>{labels.overview}</h2>
            </header>
            <div className="experience-prose">{item.description}</div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
