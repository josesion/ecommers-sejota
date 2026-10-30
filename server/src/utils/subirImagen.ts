import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Config } from "../config/r2";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client(r2Config);

export async function generarUrlSubidaImagen(
  carpeta: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const key = `${carpeta}/${uuidv4()}`;
  const command = new PutObjectCommand({
    Bucket: r2Config.bucket,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return { url, key };
}
