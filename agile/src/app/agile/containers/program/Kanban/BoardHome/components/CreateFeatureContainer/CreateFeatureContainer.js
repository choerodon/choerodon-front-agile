import React, { Component } from 'react';
import { observer } from 'mobx-react';
import CreateFeature from '../../../../../../components/CreateFeature';
import KanbanStore from '../../../../../../stores/Program/Kanban/KanbanStore';

@observer
class CreateFeatureContainer extends Component {
  handleCancel=() => {
    KanbanStore.setCreateFeatureVisible(false);
  }


  render() {
    const visible = KanbanStore.createFeatureVisible;
    return <CreateFeature visible={visible} onCancel={this.handleCancel} {...this.props} />;
  }
} 

export default CreateFeatureContainer;
