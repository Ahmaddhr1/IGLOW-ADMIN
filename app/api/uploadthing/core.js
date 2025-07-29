import { createUploadthing } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
      fileTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete. File URL:", file.url);
  }),
};
