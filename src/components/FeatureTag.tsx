import "./FeatureTag.css";

interface FeatureTagProps {
  label: string;
}

export function FeatureTag({ label }: FeatureTagProps) {
  return <span className="feature-tag">{label}</span>;
}
