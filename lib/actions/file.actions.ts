"use server";

import { createAdminClient } from "../appwrite";
import { ID, Models, Query } from "node-appwrite"; 
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./users.action";

interface UploadFileProps {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
}

// ✅ Improved error handling
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  throw new Error(`${message}: ${error instanceof Error ? error.message : "Unknown error"}`);
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  try {
    console.log("🔹 Upload function triggered...");

    if (!file) throw new Error("No file provided for upload.");
    
    console.log("📂 File received:", file.name, file.size, file.type);

    // ✅ Create Appwrite Client
    const { storage, databases } = await createAdminClient();
    if (!storage || !databases) throw new Error("Failed to initialize Appwrite storage and database.");

    console.log("🔹 Appwrite storage & database initialized.");

    // ✅ Upload file directly as `File` (No `InputFile`)
    console.log("🚀 Uploading file to Appwrite storage...");
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      file // ✅ Pass file directly
    );

    console.log("✅ File uploaded successfully:", bucketFile);

    // ✅ Construct document data
    const fileType = getFileType(bucketFile.name);
    const fileDocument = {
      type: fileType.type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: fileType.extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    console.log("📄 File metadata prepared:", fileDocument);

    // ✅ Save file metadata to Appwrite Database
    console.log("📂 Saving file metadata to Appwrite database...");
    const newFile = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      ID.unique(),
      fileDocument
    );

    console.log("✅ File metadata saved successfully:", newFile);

    // ✅ Ensure the UI updates after upload
    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "❌ Failed to upload file");
  }
};

const createQueries = (
    currentUser: Models.Document,
    
  ) => {
    const queries = [
      Query.or([
        Query.equal("owner", [currentUser.$id]),
        Query.contains("users", [currentUser.email]),
      ]),
    ];
  
    //todo search sort list
    return queries;
  };


export const getFiles = async() => {
    const { databases } = await createAdminClient();
  
    try {
      const currentUser = await getCurrentUser();
  
      if (!currentUser) throw new Error("User not found");
  
      const queries = createQueries(currentUser);
      console.log({currentUser , queries});
      const files = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        queries,
      );
  
      console.log({ files });
      return parseStringify(files);
    } catch (error) {
      handleError(error, "Failed to get files");
    }
  };
