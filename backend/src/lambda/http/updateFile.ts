import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateFile } from '../../helpers/files'
import { getUserId } from '../utils'
import { UpdateFileRequest } from '../../requests/UpdateFileRequest'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const fileId = event.pathParameters.fileId
    if (!fileId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing request param: fileId'
        })
      }
    }
    const updatedFile: UpdateFileRequest = JSON.parse(event.body)
    const userId = getUserId(event);
    await updateFile(fileId, userId, updatedFile);

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
