import React, { Component } from 'react';
import { stores } from 'choerodon-front-boot';
import {
  Table, Tabs, Spin, Tooltip, Pagination,
} from 'choerodon-ui';
import TypeTag from '../../../../../components/TypeTag';
import PriorityTag from '../../../../../components/PriorityTag';
import StatusTag from '../../../../../components/StatusTag';
import { loadSprintIssues } from '../../../../../api/NewIssueApi';

import './SprintDetails.scss';

const { TabPane } = Tabs;
const { AppState } = stores;
class SprintDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      pagination: {
        current: 1,
        pageSize: 10,
      },
      sprintId: undefined,
      doneIssues: [],
      undoIssues: [],
      undoAndNotEstimatedIssues: [],
      activeKey: 'done',
    };
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.sprintId !== this.props.sprintId) {
      const { sprintId } = nextProps;
      this.setState({
        sprintId,
      });
      this.loadDoneIssues(sprintId);
    }
  }

    handleTableChange = (pagination) => {
      const { activeKey, sprintId } = this.state;
      const ARRAY = {
        done: 'loadDoneIssues',
        undo: 'loadUndoIssues',
        undoAndNotEstimated: 'loadUndoAndNotEstimatedIssues',
      };
      this.setState({
        pagination,
      });
      this[ARRAY[activeKey]](sprintId, {
        page: pagination.current - 1,
        size: pagination.pageSize,
      });
    }

    handleTabChange = (key) => {
      const { sprintId } = this.state;
      this.setState({
        activeKey: key,
      });
      const ARRAY = {
        done: 'loadDoneIssues',
        undo: 'loadUndoIssues',
        undoAndNotEstimated: 'loadUndoAndNotEstimatedIssues',
      };
      this[ARRAY[key]](sprintId);
    }

    loadDoneIssues(sprintId) {
      this.setState({
        loading: true,
      });
      loadSprintIssues(sprintId, 'done')
        .then((res) => {
          this.setState({
            doneIssues: res.content,
            loading: false,
          });
        })
        .catch((e) => {
          this.setState({
            loading: false,
          });
          Choerodon.handleResponseError(e);
        });
    }
  
    loadUndoIssues(sprintId) {
      this.setState({
        loading: true,
      });
      loadSprintIssues(sprintId, 'unfinished')
        .then((res) => {
          this.setState({
            undoIssues: res.content,
            loading: false,
          });
        })
        .catch((e) => {
          this.setState({
            loading: false,
          });
          Choerodon.handleResponseError(e);
        });
    }

    loadUndoAndNotEstimatedIssues(sprintId) {
      this.setState({
        loading: true,
      });
      loadSprintIssues(sprintId, 'unfinished')
        .then((res) => {
          this.setState({
            undoAndNotEstimatedIssues: res.content.filter(item => (item.storyPoints === 0 && item.typeCode === 'story') || (item.remainTime === null && item.typeCode === 'task')),
            loading: false,
          });
        })
        .catch((e) => {
          this.setState({
            loading: false,
          });
          Choerodon.handleResponseError(e);
        });
    }

    renderDoneIssues(column) {
      const { loading, doneIssues, pagination } = this.state;
      return (
        <div>
          <Table
            rowKey={record => record.issueId}
            dataSource={doneIssues}
            columns={column}
            filterBar={false}
            pagination={pagination}
            scroll={{ x: true }}
            loading={loading}
            onChange={this.handleTableChange}
          />
        </div>
      );
    }

    renderUndoIssues(column) {
      const { loading, undoIssues, pagination } = this.state;
      return (
        <div>
          <Table
            rowKey={record => record.issueId}
            dataSource={undoIssues}
            columns={column}
            filterBar={false}
            pagination={pagination}
            scroll={{ x: true }}
            loading={loading}
            onChange={this.handleTableChange}
          />
        </div>
      );
    }

    renderUndoAndNotEstimatedIssues(column) {
      const { loading, undoAndNotEstimatedIssues, pagination } = this.state;
      return (
        <div>
          <Table
            rowKey={record => record.issueId}
            dataSource={undoAndNotEstimatedIssues}
            columns={column}
            filterBar={false}
            pagination={pagination}
            scroll={{ x: true }}
            loading={loading}
            onChange={this.handleTableChange}
          />
        </div>
      );
    }
  
    render() {
      const { activeKey } = this.state;
      const column = [{
        title: '关键字',
        dataIndex: 'issueNum',
        key: 'keyword',
        // width: '94px',
        render: (issueNum, record) => (
          <span
            style={{
              color: '#3f51b5',
              cursor: 'pointer',
            }}
            role="none"
            onClick={() => {
              const { history } = this.props;
              const urlParams = AppState.currentMenuType;
              history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${issueNum}&paramIssueId=${record.issueId}&paramUrl=reporthost/sprintreport`);
            }}
          >
            {issueNum} 
            {' '}
            {record.addIssue ? '*' : ''}

          </span>
        ),
      }, {
        title: '概要',
        dataIndex: 'summary',
        key: 'summary',
        render: summary => (
          <Tooltip title={summary}>
            <div
              role="none"
              style={{ 
                maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              <a>
                {summary}
              </a>
            </div>
          </Tooltip>
        ),
      }, {
        title: '问题类型',
        dataIndex: 'typeCode',
        key: 'typeCode',
        render: (typeCode, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${record.typeCode}`}>
              <div>
                <TypeTag
                  typeCode={record.typeCode}
                  showName
                />
              </div>
            </Tooltip>
          </div>
        ),
      }, {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        render: (text, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`优先级： ${record.priorityName}`}>
              <div style={{ marginRight: 12 }}>
                <PriorityTag
                  priority={record.priorityCode}
                />
              </div>
            </Tooltip>
          </div>
        ),
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${record.statusName}`}>
              <div>
                <StatusTag
                  style={{ display: 'inline-block' }}
                  name={record.statusName}
                  color={record.statusColor}
                />
              </div>
            </Tooltip>
          </div>
        ), 
      }, {
        title: '剩余时间',
        dataIndex: 'remainingTime',
        key: 'remainingTime',
        render: (remainingTime, record) => (
          <span>{`${remainingTime === null ? '0' : (`${remainingTime}h`)}`}</span>
        ),
      }, {
        title: '故事点',
        dataIndex: 'storyPoints',
        key: 'storyPoints',
        render: (storyPoints, record) => (
          <div>
            {record.typeCode === 'story' ? storyPoints || '0' : ''}
          </div>
        ),
      }];
      return (
        <div className="c7n-SprintDetails">
          <div className="c7n-SprintDetails-tabs">
            <Tabs activeKey={activeKey} onChange={this.handleTabChange}>
              <TabPane tab="已完成的问题" key="done">
                {this.renderDoneIssues(column)}
              </TabPane>
              <TabPane tab="未完成的问题" key="undo">
                {this.renderUndoIssues(column)}
              </TabPane>
              <TabPane tab="从Sprint中删除的问题" key="undoAndNotEstimated">
                {this.renderUndoAndNotEstimatedIssues(column)}
              </TabPane>
            </Tabs>
          </div>
        </div>
      );
    }
}

export default SprintDetails;
