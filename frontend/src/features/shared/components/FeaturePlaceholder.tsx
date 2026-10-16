type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <section className="feature-placeholder" aria-labelledby="feature-placeholder-title">
      <span className="section-eyebrow">PRÓXIMAMENTE</span>
      <h1 id="feature-placeholder-title">{title}</h1>
      <p>{description}</p>
      <div className="feature-placeholder-status">
        <span className="status-dot" />
        Esta sección está lista para configurarse.
      </div>
    </section>
  );
}
