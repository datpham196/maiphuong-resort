import type { PublicExperience } from "@/services/experiences";
import { ExperienceGallerySlider } from "@/components/experiences/experience-gallery-slider";
import { formatExperiencePrice, splitContentLines } from "@/components/experiences/experience-media";

type Props = {
  item: PublicExperience;
  locale: string;
  groupLabel: string;
  labels: {
    overview: string;
    price: string;
    conditions: string;
  };
};

export function ExperienceLayout3({ item, locale, groupLabel, labels }: Props) {
  const price = formatExperiencePrice(item, locale);
  const conditions = splitContentLines(item.conditions);

  return (
    <article className="experience-layout experience-layout-3">
      <ExperienceGallerySlider item={item} groupLabel={groupLabel} />

      <div className="experience-detail-body">
        {price ? (
          <section className="experience-price-panel" aria-label={labels.price}>
            <p className="experience-price-panel-label">{labels.price}</p>
            <p className="experience-price-panel-value">{price}</p>
            {item.priceNote ? <p className="experience-price-panel-note">{item.priceNote}</p> : null}
          </section>
        ) : null}

        {conditions.length > 0 ? (
          <section className="experience-section" aria-label={labels.conditions}>
            <header className="experience-section-head">
              <p className="eyebrow">{labels.conditions}</p>
              <h2>{labels.conditions}</h2>
            </header>
            <ul className="experience-checklist">
              {conditions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
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
