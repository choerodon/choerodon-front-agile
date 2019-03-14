import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'choerodon-ui';
import { store } from 'choerodon-front-boot';
import CreateFeature from '../CreateFeature';
import FeatureDetail from '../FeatureDetail';

@observer
class FeatureList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createFeatureVisible: false, 
    };
  }

  handleCreateFeatureBtnClick = () => {
    this.setState({
      createFeatureVisible: true,
    });
  }

  onOKOrCancel = () => {
    this.setState({
      createFeatureVisible: false,
    });
  }

  render() {
    const { createFeatureVisible } = this.state;
    return (
      <div>
        <Button onClick={this.handleCreateFeatureBtnClick}>
          {'打开侧边栏'}
        </Button>
        <CreateFeature 
          visible={createFeatureVisible} 
          callback={this.onOKOrCancel}
        />
        {/* <FeatureDetail /> */}
      </div>
    );
  }
}

export default FeatureList;
