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

import { createFile, deleteFile, getFiles, patchFile } from '../api/files-api'
import Auth from '../auth/Auth'
import { File } from '../types/File'

interface FilesProps {
  auth: Auth
  history: History
}

interface FilesState {
  files: File[]
  newFileName: string
  loadingFiles: boolean
}

export class Files extends React.PureComponent<FilesProps, FilesState> {
  state: FilesState = {
    files: [],
    newFileName: '',
    loadingFiles: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newFileName: event.target.value })
  }

  onEditButtonClick = (fileId: string) => {
    this.props.history.push(`/files/${fileId}/edit`)
  }

  onFileCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newFile = await createFile(this.props.auth.getIdToken(), {
        name: this.state.newFileName,
        fileUrl: '' // TODO: generate and add file url here
      })
      this.setState({
        files: [...this.state.files, newFile],
        newFileName: ''
      })
    } catch {
      alert('File creation failed')
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

  onFileCheck = async (pos: number) => {
    try {
      const file = this.state.files[pos]
      await patchFile(this.props.auth.getIdToken(), file.fileId, {
        name: file.name
      })
      // TODO: Update displayed name if needed
      // this.setState({
      //   files: update(this.state.files, {
      //     [pos]: { done: { $set: !file.done } }
      //   })
      // })
    } catch {
      alert('File deletion failed')
    }
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
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onFileCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
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
              {/*<Grid.Column width={1} verticalAlign="middle">*/}
              {/*  <Checkbox*/}
              {/*    onChange={() => this.onFileCheck(pos)}*/}
              {/*    checked={file.done}*/}
              {/*  />*/}
              {/*</Grid.Column>*/}
              <Grid.Column width={10} verticalAlign="middle">
                {file.name}
              </Grid.Column>
              {/*<Grid.Column width={3} floated="right">*/}
              {/*  {file.dueDate}*/}
              {/*</Grid.Column>*/}
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(file.fileId)}
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
}
