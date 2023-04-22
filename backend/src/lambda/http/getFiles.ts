import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getFilesForUser } from '../../helpers/files'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId: string = getUserId(event);
    const files = await getFilesForUser(userId);

    return {
        statusCode: 200,
        body: JSON.stringify({ items: files }),
    }
})

handler.use(
  cors({
    credentials: true
  })
)
