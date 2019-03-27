import React, { Component } from 'react';
import { observer } from 'mobx-react';
import CreateFeature from '../../../../../../components/CreateFeature';
import BoardStore from '../../../../../../stores/Program/Board/BoardStore';

@observer
class CreateFeatureContainer extends Component {
  handleCancel=() => {
    BoardStore.setCreateFeatureVisible(false);
  }


  render() {
    const visible = BoardStore.createFeatureVisible;
    return <CreateFeature visible={visible} onCancel={this.handleCancel} {...this.props} />;
  }
} 

export default CreateFeatureContainer;
