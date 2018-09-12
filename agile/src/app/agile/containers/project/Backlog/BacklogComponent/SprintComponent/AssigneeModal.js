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
      title: '故事点',
      dataIndex: 'totalStoryPoints',
      key: 'totalStoryPoints',
      render: text => (text || '无'),
    }, {
      title: '剩余预估时间',
      dataIndex: 'totalRemainingTime',
      index: 'totalRemainingTime',
      render: text => (text || '无'),
    }];
    const assignData = this.props.data.assigneeIssues;
    let totalIssue = 0;
    let totalStoryPoints = 0;
    let totalTime = 0;
    if (Array.isArray(assignData)) {
      for (let index = 0, lens = assignData.length; index < lens; index += 1) {
        if (assignData[index].issueCount) {
          totalIssue += assignData[index].issueCount;
        }
        if (assignData[index].totalStoryPoints) {
          totalStoryPoints += assignData[index].totalStoryPoints;
        }
        if (assignData[index].totalRemainingTime) {
          totalTime += assignData[index].totalRemainingTime;
        }
      }
    }
    const total = { totalIssue, totalStoryPoints, totalTime };
    const noAssign = this.props.data.assigneeIssues.filter(item => !item.assigneeName);
    const dataSource = this.props.data.assigneeIssues.filter(item => item.assigneeName).concat(noAssign);
    return (
      <Sidebar
        title="经办人工作量"
        visible={this.props.visible}
        onOk={this.props.onCancel.bind(this)}
        okText="确定"
        okCancel={false}
      >
        <Content
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
          title={`“${this.props.data.sprintName}”的经办人工作量`}
          description="您可以在这里查看当前冲刺中问题的分配情况，包括每位成员的问题数量、故事点数总和、剩余预估时间总和等信息。"
        >
          <Table
            pagination={dataSource + 1 > 10}
            dataSource={_.concat(dataSource, {
              assigneeName: '合计',
              issueCount: total.totalIssue,
              totalStoryPoints: total.totalStoryPoints,
              totalRemainingTime: total.totalTime,
            })}
            columns={columns}
            filterBar={false}
            rowKey={'assigneeName'}
          />
        </Content>
      </Sidebar>
    );
  }
}

export default AssigneeModal;

