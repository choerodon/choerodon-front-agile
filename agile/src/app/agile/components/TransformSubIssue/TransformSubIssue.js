import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Modal } from 'choerodon-ui';

import './TransformSubIssue.scss';
import '../../containers/main.scss';

const { AppState } = stores;
const { Sidebar } = Modal;

class TransformSubIssue extends Component {
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
        className="c7n-transformSubIssue"
        title="转化为子问题"
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="转化"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            padding: 0,
            width: 520,
          }}
          title="转化为子问题"
          description="对问题进行转化为子问题"
          link="#"
        />
      </Sidebar>
    );
  }
}
export default withRouter(TransformSubIssue);
