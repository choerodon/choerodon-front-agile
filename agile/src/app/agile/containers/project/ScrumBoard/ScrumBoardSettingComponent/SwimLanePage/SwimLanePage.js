import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Content, stores } from 'choerodon-front-boot';
import { Button, Select, Icon, message } from 'choerodon-ui';

const { AppState } = stores;
const Option = Select.Option;

@observer
class SwimLanePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Content
        description="Swimlane一横排是一行的主板。可以用于组的问题。Swimlane类型可以更改如下，并将被自动保存。注意:查询将不会丢失的更改为另一种Swimlane类型。"
        style={{
          padding: 0,
        }}
      >
        <Select style={{ width: 512 }} label="基础泳道在" defaultValue="story">
          <Option value="story">故事</Option>
          <Option value="assigneer">经办人</Option>
          <Option value="none">经办人</Option>
        </Select>
      </Content>
    );
  }
}

export default SwimLanePage;

