import { createSocialImage } from "./social-image";

export const runtime = "nodejs";

export const alt =
  "Sinaliza — plataforma visual e interativa para aprender Libras";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSocialImage();
}
