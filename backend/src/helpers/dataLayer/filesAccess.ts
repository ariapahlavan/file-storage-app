import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { FileItem } from '../../models/FileItem'
import { FileUpdate } from '../../models/FileUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('FilesAccess')

export class FilesAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly storageTable: string = process.env.STORAGE_TABLE,
    private readonly storageTableIndex: string = process.env.STORAGE_CREATED_AT_INDEX,
  ) {}

  async getFilesByUserId(userId: string): Promise<FileItem[]> {
    logger.info(`Getting files owned by user: ${userId}`);

    const result = await this.docClient.query({
      TableName: this.storageTable,
      IndexName: this.storageTableIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    }).promise();

    return result.Items as FileItem[];
  }

  async createFile(newItem: FileItem): Promise<FileItem> {
    logger.info(`Creating a new file item: ${JSON.stringify(newItem)}`);

    await this.docClient.put({
      TableName: this.storageTable,
      Item: newItem
    }).promise();

    return newItem;
  }

  async getFileById(fileId: string, userId: string): Promise<FileItem> {
    const result = await this.docClient.get({
      TableName: this.storageTable,
      Key: { fileId, userId }
    }).promise()

    return result.Item ? result.Item as FileItem : undefined;
  }

  async updateFileById(fileId: string, userId: string, fileUpdate: FileUpdate): Promise<void> {
    await this.docClient.update({
      TableName: this.storageTable,
      Key: { fileId, userId },
      UpdateExpression: 'set #nameattr = :name',
      ExpressionAttributeNames: { '#nameattr': 'name' },
      ExpressionAttributeValues: {
        ':name': fileUpdate.name
      },
    }).promise()
  }

  async addFileAttachmentById(fileId: string, userId: string, fileUrl: string): Promise<void> {
    await this.docClient.update({
      TableName: this.storageTable,
      Key: { fileId, userId },
      UpdateExpression: 'set fileUrl = :fileUrl',
      ExpressionAttributeValues: { ':fileUrl': fileUrl },
    }).promise()
  }

  async deleteFileById(fileId: string, userId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.storageTable,
      Key: { fileId, userId }
    }).promise();
  }
}
