import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: "public_xqkMAX8K3tME//Ug061tFSOJfcY=",
  privateKey: "private_gPsfbdoaQveWo4HIIl0aW2q/8rg=",
  urlEndpoint: "https://ik.imagekit.io/chauhancomputers",
});

export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    return NextResponse.json({ error: "Auth Failed" }, { status: 500 });
  }
}