import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// ImageKit Setup - Yahan apni ImageKit dashboard se keys daalna
const imagekit = new ImageKit({
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No image file found' }, { status: 400 });
    }

    // File ko buffer (binary) me convert kar rahe hain ImageKit ke liye
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ImageKit par upload kar rahe hain
    const response = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: '/chouhan_computers' // Is folder me images save hongi
    });

    // Upload hone ke baad URL wapas bhej rahe hain
    return NextResponse.json({ url: response.url }, { status: 200 });

  } catch (error) {
    console.error("ImageKit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}