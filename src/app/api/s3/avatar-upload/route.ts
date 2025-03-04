import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

/**
 * Direct file upload API endpoint
 * Handles multipart/form-data directly to simplify the client-side code
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const userId = formData.get('userId');
    const file = formData.get('file') as File | null;

    // Validate input
    if (!userId || !file) {
      return NextResponse.json({ message: "Missing userId or file" }, { status: 400 });
    }

    // Get file details
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to S3
    const result = await uploadFileToS3(buffer, `avatars/${userId}.jpg`);

    if (result) {
      return NextResponse.json({ 
        message: "Avatar uploaded successfully", 
        result,
        url: `avatars/${userId}.jpg`
      });
    } else {
      return NextResponse.json({ message: "Failed to upload avatar" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json({ 
      message: "Error processing upload",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * Helper function to upload a file buffer to S3
 */
async function uploadFileToS3(file: Buffer, key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: key,
    Body: file,
    ContentType: 'image/jpeg',
  });

  const result = await s3Client.send(command);
  return result;
} 