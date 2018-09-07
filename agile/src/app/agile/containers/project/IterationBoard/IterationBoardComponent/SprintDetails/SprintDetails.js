import React, { Component } from 'react';
import { stores } from 'choerodon-front-boot';
import {
  Table, Tabs, Spin, Tooltip, Pagination,
} from 'choerodon-ui';
import _ from 'lodash';
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
      pagination: undefined,
      sprintId: undefined,
      doneIssues: [],
      undoIssues: [],
      undoAndNotEstimatedIssues: [],
      activeKey: 'done',
      done: false,
      undo: false,
      undoAndNotEstimated: false, // 用来判断是否已经加载过数据，如果为true，说明已经load，不再重新load
    };
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.sprintId !== this.props.sprintId) {
      const { sprintId } = nextProps;
      this.setState({
        sprintId,
        done: false,
        undo: false,
        undoAndNotEstimated: false,
      });
      this.loadDoneIssues(sprintId);
    }
  }

  getPagination = (pagination, res) => { // 注意：pagination
    if (pagination == undefined) {
      return res.content.length > 10 ? { current: 1, pageSize: 10 } : false;
    } else {
      return { current: pagination.page + 1, pageSize: pagination.size };
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
        // pagination: { current: 1, pageSize: 10 }, // 注意每次tab切换要重设pagination,否则current可能是上一个tab的值
      });
      const ARRAY = {
        done: 'loadDoneIssues',
        undo: 'loadUndoIssues',
        undoAndNotEstimated: 'loadUndoAndNotEstimatedIssues',
      };
      if (!this.state[key]) {
        this[ARRAY[key]](sprintId);
      } else {
        this.setState({
          pagination: this.state[_.lowerFirst(_.trim(ARRAY[key], 'load'))].length > 10 ? { current: 1, pageSize: 10 } : false,
        });
      }
    }

    loadDoneIssues(sprintId, pagination) {
      this.setState({
        loading: true,
        done: true,
      });
      loadSprintIssues(sprintId, 'done')
        .then((res) => {
          this.setState({
            doneIssues: res.content,
            loading: false,
            pagination: this.getPagination(pagination, res),
          });
        })
        .catch((e) => {
          this.setState({
            loading: false,
          });
          Choerodon.handleResponseError(e);
        });
    }
  

    loadUndoIssues(sprintId, pagination) {
      this.setState({
        loading: true,
        undo: true,
      });
      loadSprintIssues(sprintId, 'unfinished')
        .then((res) => {
          this.setState({
            undoIssues: res.content,
            loading: false,
            pagination: this.getPagination(pagination, res),
          });
        })
        .catch((e) => {
          this.setState({
            loading: false,
          });
          Choerodon.handleResponseError(e);
        });
    }

    loadUndoAndNotEstimatedIssues(sprintId, pagination) {
      this.setState({
        loading: true,
        undoAndNotEstimated: true,
      });
      loadSprintIssues(sprintId, 'unfinished')
        .then((res) => {
          this.setState({
            undoAndNotEstimatedIssues: res.content.filter(item => (item.storyPoints === 0 && item.typeCode === 'story') || (item.remainTime === null && item.typeCode === 'task')),
            loading: false,
            pagination: this.getPagination(pagination, res),
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
      const { activeKey, pagination } = this.state;
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
              <TabPane tab="未完成的未预估问题" key="undoAndNotEstimated">
                {this.renderUndoAndNotEstimatedIssues(column)}
              </TabPane>
            </Tabs>
          </div>
        </div>
      );
    }
}

export default SprintDetails;
