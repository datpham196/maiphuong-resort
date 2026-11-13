import type { PublicExperience } from "@/services/experiences";
import { ExperienceGallerySlider } from "@/components/experiences/experience-gallery-slider";
import { ExperienceImg } from "@/components/experiences/experience-media";

type Props = {
  item: PublicExperience;
  groupLabel: string;
  labels: {
    overview: string;
    gallery: string;
  };
};

export function ExperienceLayout1({ item, groupLabel, labels }: Props) {
  const gallery = item.images.filter((image) => !image.cover);
  const featured = gallery[0] ?? null;
  const thumbs = gallery.slice(1);

  return (
    <article className="experience-layout experience-layout-1">
      <ExperienceGallerySlider item={item} groupLabel={groupLabel} />

      <div className="experience-detail-body">
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

      {featured ? (
        <section className="experience-bottom-gallery" aria-label={labels.gallery}>
          <header className="experience-section-head">
            <p className="eyebrow">{labels.gallery}</p>
            <h2>{labels.gallery}</h2>
          </header>
          <div className="experience-gallery-board">
            <figure className="experience-gallery-featured">
              <ExperienceImg url={featured.url} alt={featured.altText ?? item.title} />
            </figure>
            {thumbs.length > 0 ? (
              <div className="experience-gallery-thumbs">
                {thumbs.map((image) => (
                  <figure key={image.id}>
                    <ExperienceImg url={image.url} alt={image.altText ?? item.title} />
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </article>
  );
}
