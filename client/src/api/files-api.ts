import { apiEndpoint } from '../config'
import { File } from '../types/File';
import { CreateFileRequest } from '../types/CreateFileRequest';
import Axios from 'axios'
import { UpdateFileRequest } from '../types/UpdateFileRequest';

export async function getFiles(idToken: string): Promise<File[]> {
  console.log('Fetching files')

  const response = await Axios.get(`${apiEndpoint}/files`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Files:', response.data)
  return response.data.items
}

export async function createFile(
  idToken: string,
  newFile: CreateFileRequest
): Promise<File> {
  const response = await Axios.post(`${apiEndpoint}/files`,  JSON.stringify(newFile), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchFile(
  idToken: string,
  fileId: string,
  updatedFile: UpdateFileRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/files/${fileId}`, JSON.stringify(updatedFile), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteFile(
  idToken: string,
  fileId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/files/${fileId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  fileId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/files/${fileId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
