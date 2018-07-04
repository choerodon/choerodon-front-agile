import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Modal } from 'choerodon-ui';

import './CopyIssue.scss';
import '../../containers/main.scss';

const { AppState } = stores;
const { Sidebar } = Modal;

class CopyIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
    };
  }

  componentDidMount() {
  }

  render() {
    const { initValue, visible, onCancel, onOk } = this.props;

    return (
      <Sidebar
        className="c7n-copyIssue"
        title="复制问题"
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="复制"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            padding: 0,
            width: 520,
          }}
          title="复制问题"
          description="对问题进行复制"
          link="#"
        />
      </Sidebar>
    );
  }
}
export default withRouter(CopyIssue);
