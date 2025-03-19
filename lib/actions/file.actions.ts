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
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
    const queries = [
      Query.or([
        Query.equal("owner", [currentUser.$id]),
        Query.contains("users", [currentUser.email]),
      ]),
    ];
    if (types.length > 0) queries.push(Query.equal("type", types));
    if (searchText) queries.push(Query.contains("name", searchText));
    if (limit) queries.push(Query.limit(limit));
    if (sort) {
      const [sortBy, orderBy] = sort.split("-");
  
      queries.push(
        orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
      );
    }
    return queries;
  };


  export const getFiles = async ({
    types = [],
    searchText = "",
    sort = "$createdAt-desc",
    limit,
  }: GetFilesProps) => {
    const { databases } = await createAdminClient();
  
    try {
      const currentUser = await getCurrentUser();
  
      if (!currentUser) throw new Error("User not found");
  
      const queries = createQueries(currentUser , types , searchText , sort , limit);
      console.log({ queries});
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
  export const renameFile = async ({
    fileId,
    name,
    extension,
    path,
  }: RenameFileProps) => {
    const { databases } = await createAdminClient();
  
    try {
      const newName = `${name}.${extension}`;
      const updatedFile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId,
        {
          name: newName,
        },
      );
  
      revalidatePath(path);
      return parseStringify(updatedFile);
    } catch (error) {
      handleError(error, "Failed to rename file");
    }
  };

  export const updateFileUsers = async ({
    fileId,
    emails,
    path,
  }: UpdateFileUsersProps) => {
    const { databases } = await createAdminClient();
  
    try {
      const updatedFile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId,
        {
          users: emails,
        },
      );
  
      revalidatePath(path);
      return parseStringify(updatedFile);
    } catch (error) {
      handleError(error, "Failed to rename file");
    }
  };

  export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};
