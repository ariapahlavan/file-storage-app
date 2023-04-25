import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, patchFile, uploadFile } from '../api/files-api'

interface EditFileProps {
  match: {
    params: {
      fileId: string,
      fileName: string
    }
  }
  auth: Auth
}

interface EditFileState {
  fileName: string
  currentFileName: string
}

export class EditFile extends React.PureComponent<
  EditFileProps,
  EditFileState
> {
  state: EditFileState = {
    currentFileName: this.props.match.params.fileName,
    fileName: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ fileName: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.fileName) {
        alert('File name is required')
        return
      }

      if (this.state.fileName === this.state.currentFileName) {
        alert('The new file name must not match the existing name')
        return
      }

      const fileId = this.props.match.params.fileId;
      await patchFile(this.props.auth.getIdToken(), fileId, {
        name: this.state.fileName
      })
      alert('File name updated successfully')
    } catch (e) {
      alert('Could not update the file name: ' + (e as Error).message)
    }
  }

  render() {
    return (
      <div>
        <h1>Edit file</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="text"
              placeholder={this.state.currentFileName}
              onChange={this.handleNameChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        <Button
          type="submit"
        >
          Update file name
        </Button>
      </div>
    )
  }
}
