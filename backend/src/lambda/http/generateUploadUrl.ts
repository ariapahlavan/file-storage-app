import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/businessLogic/files'
import { getUserId } from '../utils'

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
    const userId: string = getUserId(event);
    const uploadUrl = await createAttachmentPresignedUrl(fileId, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
