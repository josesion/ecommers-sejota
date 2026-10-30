import { Readable } from "stream";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Config } from "../config/r2";

const s3Client = new S3Client(r2Config);

export async function subirArchivo(
  key: string,
  body: Buffer | Readable,
  contentType: string
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function eliminarArchivo(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
    })
  );
}

export async function obtenerUrlFirmada(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: r2Config.bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}
