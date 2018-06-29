import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Modal, Select } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

const { Sidebar } = Modal;
const { AppState } = stores;
const Option = Select.Option;

@observer
class CloseSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectChose: '0',
    };
  }
  handleCloseSprint() {
    const data = {
      incompleteIssuesDestination: parseInt(this.state.selectChose, 10),
      projectId: parseInt(AppState.currentMenuType.id, 10),
      sprintId: this.props.data.sprintId,
    };
    BacklogStore.axiosCloseSprint(data).then((res) => {
      this.props.onCancel();
      this.props.refresh();
    }).catch((error) => {
      window.console.error(error);
    });
  }
  render() {
    const data = this.props.data;
    const completeMessage = JSON.stringify(BacklogStore.getSprintCompleteMessage) === '{}' ? null : BacklogStore.getSprintCompleteMessage;
    return (
      <Sidebar
        title="完成冲刺"
        visible={this.props.visible}
        okText="结束"
        cancelText="取消"
        onCancel={this.props.onCancel.bind(this)}
        onOk={this.handleCloseSprint.bind(this)}
      >
        <Content
          style={{
            padding: 0,
            paddingBottom: 20,
          }}
          title={`完成冲刺“${data.sprintName}”`}
          description="请在下面选择未完成问题的去向，以完成一个冲刺计划。"
          link="http://choerodon.io/zh/docs/user-guide/agile/sprint/close-sprint/"
        >
          <p className="c7n-closeSprint-message">
            <span>{!_.isNull(completeMessage) ? completeMessage.partiallyCompleteIssues : ''}</span> 个问题 已经完成
          </p>
          <p style={{ marginTop: 24 }} className="c7n-closeSprint-message">
            <span>{!_.isNull(completeMessage) ? completeMessage.incompleteIssues : ''}</span> 个问题 未完成
          </p>
          <p style={{ marginTop: 19, color: 'rgba(0,0,0,0.65)' }}>子任务数不包含在上面的合计中，它们只能与父问题在同一个Sprint中。</p>
          <p style={{ fontSize: 14, marginTop: 36 }}>选择所有应移动的不完整问题：</p>
          <Select 
            label="移动至" 
            style={{ marginTop: 12, width: 512 }} 
            value={this.state.selectChose}
            onChange={(value) => {
              this.setState({
                selectChose: value,
              });
            }}
          >
            {!_.isNull(completeMessage) ? (
              completeMessage.sprintNames.map(item => (
                <Option value={item.sprintId}>{item.sprintName}</Option>
              ))
            ) : ''}
            <Option value="0">待办事项</Option>
          </Select>
        </Content>
      </Sidebar>
    );
  }
}

export default CloseSprint;

