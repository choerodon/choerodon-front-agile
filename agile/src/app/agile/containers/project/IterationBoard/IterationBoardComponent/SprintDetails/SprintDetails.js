import React, { Component } from 'react';
import { stores } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import {
  Icon, Table, Tabs, Spin, Tooltip, Pagination,
} from 'choerodon-ui';
import TypeTag from '../../../../../components/TypeTag';
import PriorityTag from '../../../../../components/PriorityTag';
import StatusTag from '../../../../../components/StatusTag';
import IterationBoardStore from '../../../../../stores/project/IterationBoard/IterationBoardStore';
import './SprintDetails.scss';

const TabPane = Tabs.TabPane;
@observer
class SprintDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
    };
  }
  
  componentWillMount() {
    // this.loadData();
  }

    loadData = (pagination) => {
      this.setState({
        loading: true,
      });
      IterationBoardStore.axiosGetSprintDetailData({
        page: pagination.current - 1,
        size: pagination.pageSize,
      }).then((data) => {
        IterationBoardStore.setSpintDetailData(data);
        this.setState({
          loading: false,
          pagination: {
            current: pagination.current,
            pageSize: Pagination.pageSize,
            total: data.totalElements,
          },
        });
      }).catch((error) => {
        this.setState({
          loading: false,
        });
        Choerodon.handleResponseError(error);
      });
    }

    handleTableChange = (pagination) => {
      this.loadData({
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
    }

    renderTable(dataType) {
      const spintDetailData = IterationBoardStore.getSprintDetailData;// 边界,空对象或数组
      const columns = [{
        title: '关键字',
        dataIndex: 'keyword',
        key: 'keyword',
        // width: '94px',
        render: (text, record) => (
          <Tooltip title={text}>
            <div
              role="none"
              style={{ 
                maxWidth: '94px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              <a>
                {text}
              </a>
            </div>
          </Tooltip>
        ),
      }, {
        title: '概要',
        dataIndex: 'summary',
        key: 'summary',
        render: text => (
          <Tooltip title={text}>
            <div
              role="none"
              style={{ 
                maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              <a>
                {text}
              </a>
            </div>
          </Tooltip>
        ),
      }, {
        title: '问题类型',
        dataIndex: 'issueType',
        key: 'issueType',
        render: (text, recode) => (
          <TypeTag
            typeCode={text}
          />
        ),
      }, {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        render: (text, recode) => (
          <PriorityTag
            priority={text}
          />
        ),
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, recode) => (
          <StatusTag
            name={statusName}
            color={statusColor}
          />
        ), 
      }, {
        title: '剩余时间',
        dataIndex: 'restTime',
        key: 'restTime',
        render: (text, record) => (
          <span>{`${text}h`}</span>
        ),
      }, {
        title: '故事点',
        dataIndex: 'storyPoint',
        key: 'storyPoint',
        render: (text, record) => (
          <span>{text}</span>
        ),
      }, {
        title: '问题计数',
        dataIndex: 'problemCount',
        key: 'problemCount',
        render: (text, record) => (
          <span>{text}</span>
        ),
      }];
      return (
        this.state.loading ? (
          <div className="c7n-SprintDetails-loading">
            <Spin />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={`${dataType}Data`}
            pagination={this.state.pagination}
            onChange={this.handleTableChange}
          />
        )
        
      );
    }

    renderTabPane() {
      // const tabs = ['已完成的问题', '未完成的问题', '未完成的预估问题'];
      const tabs = [
        { 
          key: 'done',
          tab: '已完成的问题',
        }, {
          key: 'undo',
          tab: '未完成的问题',
        }, {
          key: 'undoAndNotEstimated',
          tab: '未完成的未预估问题',
        }];

      const tabPanes = tabs.map(item => (
        <TabPane tab={item.tab} key={item.key}>
          {this.renderTable(item.key)}
        </TabPane>
      ));
      return tabPanes;    
    }

    render() {
      return (
        <div className="c7n-SprintDetails">
          <div className="c7n-SprintDetails-tabs">
            {/* <Tabs>
              {this.renderTabPane()}
            </Tabs> */}
          </div>
        </div>
      );
    }
}

export default SprintDetails;
