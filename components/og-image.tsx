import { generate as DefaultImage } from 'fumadocs-ui/og';

export function OGImage({
  title,
  description,
  logoSvg,
}: {
  title: string;
  description?: string;
  logoSvg: string;
}) {
  // Convert SVG to data URL (URL encode)
  const logoSvgDataUrl = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

  // Use DefaultImage but pass the logo as the site prop (it accepts ReactNode)
  return (
    <DefaultImage
      title={title}
      description={description}
      site={
        <img
          src={logoSvgDataUrl}
          alt="Buildstash"
          width={300}
          height={60}
        />
      }
    />
  );
}

