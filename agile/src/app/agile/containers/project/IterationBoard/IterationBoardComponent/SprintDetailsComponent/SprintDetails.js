import React, { Component } from 'react';
import { stores } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import {
  Icon, Table, Tabs, Spin, Tooltip,
} from 'choerodon-ui';
import TypeTag from '../../../../../components/TypeTag';
import PriorityTag from '../../../../../components/PriorityTag';
import StatusTag from '../../../../../components/StatusTag';
import IterationBoardStore from '../../../../../stores/project/IterationBoard/IterationBoardStore';
import './SprintDetails.scss';

const TabPane = Tabs.TabPane;
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
    this.loadData();
  }
    loadData = (pagination) =>{
        this.setState({
            loading:true,
        });
        IterationBoardStore.

    }

    handleTableChange = () => {
        
    }

    renderTable() {
    // const dataSource =
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
        <Table
          columns={columns}
          dataSource={spintDetailData}
          onChange={this.handleTableChange}
        />
      );
    }

    renderTabPane() {
      const tabs = ['已完成的问题', '未完成的问题', '未完成的预估问题'];
      const tabPanes = tabs.map((item, index) => (
        <TabPane tab={item} key={index}>
          {this.renderTable()}
        </TabPane>
      ));
      return tabPanes;    
    }

    render() {
      return (
        <div className="c7n-SprintDetails">
          <div className="c7n-SprintDetails-nav">
            <span>冲刺详情</span>
            <Icon type="arrow_forward" />
          </div>
          <div className="c7n-SprintDetails-tabs">
            <Tabs>
              {this.renderTabPane()}
            </Tabs>
          </div>
        </div>
      );
    }
}

export default SprintDetails;
