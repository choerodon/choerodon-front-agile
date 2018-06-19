import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Table } from 'choerodon-ui';
import _ from 'lodash';
import { Page, Header, Content, stores } from 'choerodon-front-boot';

const { Sidebar } = Modal;

@observer
class AssigneeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const columns = [{
      title: '经办人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      render: text => (text === '合计' ? (
        <p >{text}</p>
      ) : (<p>{text || '未分配'}</p>)),
    }, {
      title: '问题',
      dataIndex: 'issueCount',
      key: 'issueCount',
      render: text => (text || '无'),
    }, {
      title: 'Story Points',
      dataIndex: 'totalStoryPoints',
      key: 'totalStoryPoints',
      render: text => (text || '无'),
    }, {
      title: '剩余预估时间',
      dataIndex: 'totalRemainingTime',
      index: 'totalRemainingTime',
      render: text => (text || '无'),
    }];
    return (
      <Sidebar
        title="经办人工作量"
        visible={this.props.visible}
        onOk={this.props.onCancel.bind(this)}
        okText="确定"
        cancelText="取消"
        onCancel={this.props.onCancel.bind(this)}
      >
        <Content
          style={{
            padding: 0,
          }}
          title={`"${this.props.data.sprintName}"的经办人工作量`}
          description="您可以在这里查看当前冲刺中问题的分配情况，包括每位成员的问题数量、故事点数总和、剩余预估时间总和等信息。"
        >
          <Table
            dataSource={_.concat(this.props.data.assigneeIssues, {
              assigneeName: '合计',
              issueCount: this.props.total.totalIssue,
              totalStoryPoints: this.props.total.totalStoryPoints,
              totalRemainingTime: this.props.total.totalTime,
            })}
            columns={columns}
          />
        </Content>
      </Sidebar>
    );
  }
}

export default AssigneeModal;

