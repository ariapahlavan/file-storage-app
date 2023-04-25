import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createFile, deleteFile, getFiles, getUploadUrl, patchFile, uploadFile } from '../api/files-api'
import Auth from '../auth/Auth'
import { File } from '../types/File'

interface FilesProps {
  auth: Auth
  history: History
}
enum CreateState {
  NoCreate,
  Creating,
  FetchingPresignedUrl,
  UploadingFile,
}

interface FilesState {
  files: File[]
  newFileName: string
  loadingFiles: boolean,
  createState: CreateState,
  file: any,
}

export class Files extends React.PureComponent<FilesProps, FilesState> {
  state: FilesState = {
    files: [],
    newFileName: '',
    loadingFiles: true,
    createState: CreateState.NoCreate,
    file: undefined,
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newFileName: event.target.value })
  }

  onEditButtonClick = (file: File) => {
    this.props.history.push(`/files/${file.fileId}/${file.name}/edit`)
  }

  onFileCreate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setCreateState(CreateState.Creating);
    try {
      if (!this.state.newFileName) {
        alert('File name is required')
        return
      }
      if (!this.state.file) {
        alert('File should be selected')
        return
      }
      const dueDate = this.calculateDueDate()
      const newFile = await createFile(this.props.auth.getIdToken(), {
        name: this.state.newFileName
      })
      this.setCreateState(CreateState.FetchingPresignedUrl);
      const fileId = newFile.fileId;
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), fileId);
      this.setCreateState(CreateState.UploadingFile);
      await uploadFile(uploadUrl, this.state.file)

      this.setState({
        files: [...this.state.files, newFile],
        newFileName: ''
      })
      alert('File was created!')
    } catch {
      alert('File creation failed')
    } finally {
      this.setCreateState(CreateState.NoCreate);
    }
  }

  onFileDelete = async (fileId: string) => {
    try {
      await deleteFile(this.props.auth.getIdToken(), fileId)
      this.setState({
        files: this.state.files.filter(file => file.fileId !== fileId)
      })
    } catch {
      alert('File deletion failed')
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    this.setState({
      file: files[0]
    })
  }

  async componentDidMount() {
    try {
      const files = await getFiles(this.props.auth.getIdToken())
      this.setState({
        files,
        loadingFiles: false
      })
    } catch (e) {
      alert(`Failed to fetch files: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Your files</Header>

        {this.renderCreateFileInput()}

        {this.renderFiles()}
      </div>
    )
  }

  renderCreateFileInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input type="text" placeholder="Filename..."
                 onChange={this.handleNameChange}>
            <Button color={'teal'} type="submit"
                    loading={this.state.createState !== CreateState.NoCreate}
                    onClick={this.onFileCreate}>Upload new file</Button>
            <input />
            <input
              type="file"
              accept="image/*"
              placeholder="File to upload"
              onChange={this.handleFileChange}
            />
          </Input>
          {this.state.createState === CreateState.Creating && <p>Creating your file object</p>}
          {this.state.createState === CreateState.FetchingPresignedUrl && <p>Uploading file metadata</p>}
          {this.state.createState === CreateState.UploadingFile && <p>Uploading file</p>}
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderFiles() {
    if (this.state.loadingFiles) {
      return this.renderLoading()
    }

    return this.renderFilesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading files
        </Loader>
      </Grid.Row>
    )
  }

  renderFilesList() {
    return (
      <Grid padded>
        {this.state.files.map((file, pos) => {
          return (
            <Grid.Row key={file.fileId}>
              <Grid.Column width={14} verticalAlign="middle">
                {file.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(file)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onFileDelete(file.fileId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {file.fileUrl && (
                <Image src={file.fileUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  setCreateState(createState: CreateState) {
    this.setState({ createState })
  }
}
