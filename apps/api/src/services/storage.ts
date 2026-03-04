import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  }
})

export async function getPresignedUploadUrl(fileName: string, fileType: string, folder = 'docs') {
  const key = `${folder}/${Date.now()}-${fileName.replace(/\s/g, '-')}`
  const url = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key, ContentType: fileType }),
    { expiresIn: 300 }
  )
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`
  return { uploadUrl: url, publicUrl, key }
}

export async function deleteFile(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }))
}
