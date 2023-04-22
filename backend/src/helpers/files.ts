import { FilesAccess } from './filesAccess'
import { createUploadUrl } from './attachmentUtils';
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { FileItem } from '../models/FileItem'
import { CreateFileRequest } from '../requests/CreateFileRequest'
import { UpdateFileRequest } from '../requests/UpdateFileRequest'


const logger = createLogger('Files');
const filesAccess = new FilesAccess();
const attachmentBucketName = process.env.FILE_ATTACHMENT_S3_BUCKET;

export const getFilesForUser = async (userId: string): Promise<FileItem[]> => {
  logger.info(`Getting Files for a user: ${userId}`);
  return filesAccess.getFilesByUserId(userId);
}

export const createFile = async (request: CreateFileRequest, userId: string): Promise<FileItem> => {
  logger.info(`Creating a new file from request: ${request}, for user: ${userId}`);
  const fileId = uuid.v4();
  const newItem: FileItem = {
    createdAt: new Date().toISOString(),
    userId: userId,
    fileId,
    fileUrl: `https://${attachmentBucketName}.s3.amazonaws.com/${fileId}`,
    ...request
  }

  return await filesAccess.createFile(newItem);
}

const validateExistingFileItem = async (fileId: string, userId: string) => {
  const existingFile = await filesAccess.getFileById(fileId, userId);
  if (!existingFile) {
    throw createError(404, `File with id ${fileId} was not found`);
  }

  if (existingFile.userId !== userId) {
    throw createError(403, `User is forbidden to access the file item with id ${fileId}`);
  }
}

export const updateFile = async (
  fileId: string,
  userId: string,
  updatedFile: UpdateFileRequest
): Promise<void> => {
  await validateExistingFileItem(fileId, userId);
  await filesAccess.updateFileById(fileId, userId, updatedFile);
}

export const deleteFile = async (fileId: string, userId: string) => {
  await validateExistingFileItem(fileId, userId);
  await filesAccess.deleteFileById(fileId, userId);
}

export const createAttachmentPresignedUrl = async (fileId: string, userId: string): Promise<string> => {
  await validateExistingFileItem(fileId, userId);
  // const attachmentUrl: string = `https://${attachmentBucketName}.s3.amazonaws.com/${fileId}`;
  // await filesAccess.addFileAttachmentById(fileId, userId, attachmentUrl)

  return createUploadUrl(fileId, attachmentBucketName);
}
