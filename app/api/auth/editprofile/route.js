import { getAuthUser } from "@/app/lib/auth";
import { userModel } from "@/app/Model/userSchema";
import { Connect } from "@/app/lib/Mongodb-config";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

export const POST = async (req) => {
  try {
    await Connect();

    const decode = await getAuthUser(req);

    if (!decode) {
      return NextResponse.json(
        { message: "Token not found or expired" },
        { status: 401 }
      );
    }

    const user = await userModel.findById(decode.id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const profileData = await req.formData();

    const bio = profileData.get("bio");
    const image = profileData.get("image");

    let imageUrl = user.image;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const response = await imagekit.upload({
        file: buffer,
        fileName: image.name,
        folder: "/userProfile",
      });

      imageUrl = response.url;
    }

    await userModel.findByIdAndUpdate(user._id, {
      bio,
      image: imageUrl,
    });

    return NextResponse.json(
      { message: "Profile updated" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
};