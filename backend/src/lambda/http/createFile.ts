import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils';
import { createFile } from '../../helpers/files';
import { FileItem } from '../../models/FileItem'
import { CreateFileRequest } from '../../requests/CreateFileRequest'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newFile: CreateFileRequest = JSON.parse(event.body)
    const persistedItem: FileItem = await createFile(newFile, getUserId(event));

    return {
      statusCode: 201,
      body: JSON.stringify({ item: persistedItem })
    }
})

handler.use(
  cors({
    credentials: true
  })
)
