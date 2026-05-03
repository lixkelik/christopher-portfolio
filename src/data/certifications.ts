import certificationsData from "./certifications.json";

export type Certification = {
  /** URL-safe slug, also used as React key. */
  id: string;
  title: string;
  issuer: string;
  year: number;
  /** Image path relative to /public, e.g. "certifications/aws-dev-cert.png". */
  image: string;
  /** Optional URL to the verifiable credential. */
  credentialUrl?: string;
  tags?: string[];
  /** When true, the card gets a golden glow + featured badge. */
  featured?: boolean;
};

export const certifications: Certification[] = certificationsData as Certification[];

export const certificationsCount = (): number => certifications.length;
