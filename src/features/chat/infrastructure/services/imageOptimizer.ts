import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const MAX_IMAGE_WIDTH = 1080;
const JPEG_QUALITY = 0.75;

/**
 * Redimensiona y comprime una imagen local a JPEG y la convierte en ArrayBuffer binario
 * sin pasar por serialización Base64.
 */
export async function optimizeImageToArrayBuffer(
  localUri: string,
): Promise<ArrayBuffer> {
  const context = ImageManipulator.manipulate(localUri);
  context.resize({ width: MAX_IMAGE_WIDTH });

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  const file = new File(saved.uri);
  return file.arrayBuffer();
}
