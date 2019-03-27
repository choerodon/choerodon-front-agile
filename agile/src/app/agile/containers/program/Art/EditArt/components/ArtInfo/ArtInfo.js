import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import EditArtNameSidebar from './EditArtNameSidebar';

class ArtInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editNameVisible: false,
    };
  }

  handleEditArtNameOk = (newName) => {
    const { onSubmit } = this.props;
    onSubmit({ name: newName });
    this.setState({
      editNameVisible: false,
    });
  }

  handleEditArtNameCancel = () => {
    this.setState({
      editNameVisible: false,
    });
  }

  render() {
    const { name } = this.props;
    const { editNameVisible } = this.state;
    return (
      <div style={{ fontSize: '18px', fontWeight: 500, margin: '20px 0 10px' }}>
        <span>{name}</span>
        <Icon
          role="none"
          type="mode_edit mlr-3 pointer"
          style={{
            color: '#3F51B5',
            marginLeft: 5,
            cursor: 'pointer',
          }}
          onClick={() => {
            this.setState({
              editNameVisible: true,
            });
          }}
        />

        <EditArtNameSidebar
          name={name}
          visible={editNameVisible}
          onOk={this.handleEditArtNameOk}
          onCancel={this.handleEditArtNameCancel}
        /> 
      </div>
    );
  }
}

export default ArtInfo;
