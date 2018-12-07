import React, { Component } from 'react';
import { Table, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { trace } from 'mobx';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import {
  IssueNum, TypeCode, Summary, StatusName, Priority, Assignee, LastUpdateTime, Sprint,
} from './IssueTableComponent';
import EmptyBlock from '../../../../components/EmptyBlock';
import pic from '../../../../assets/image/emptyIssue.svg';
import QuickCreateIssue from '../QuickCreateIssue/QuickCraeteIssue';

@observer
class IssueTable extends Component {
  componentWillUnmount() {
    IssueStore.setClickedRow({
      selectedIssue: {},
      expand: false,
    });
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   debugger;
  //   return true
  // }

  filterConvert = (filters) => {
    Object.keys(filters).forEach((key) => {
      switch (key) {
        case 'statusId':
        case 'priorityId':
        case 'issueTypeId':
          IssueStore.setAdvArg(filters);
          break;
        case 'label':
          IssueStore.setOtherArgs(filters);
          break;
        default:
          IssueStore.setArg({
            [key]: filters[key][0],
          });
          break;
      }
    });
  };

  barFilterConvert = (barFilters) => {
    if (IssueStore.getParamFilter) {
      barFilters.shift();
    }
    IssueStore.setBarFilters(barFilters.join(''));
  };

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    this.filterConvert(filters);
    this.barFilterConvert(barFilters);
    IssueStore.setLoading(true);
    IssueStore.loadIssues(pagination.current - 1, pagination.pageSize, sorter, barFilters).then(
      (res) => {
        IssueStore.updateFiltedIssue({
          current: res.number + 1,
          pageSize: res.size,
          total: res.totalElements,
        }, res.content, barFilters);
      },
    );
  };

  render() {
    const columnFilter = new Map([
      ['issueNum', []],
      [
        'typeId', IssueStore.getIssueTypes.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      ['summary', []],
      [
        'statusId', IssueStore.getIssueStatus.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      [
        'priorityId', IssueStore.getIssuePriority.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      ['reporterName', []],
      ['assigneeName', []],
      ['version', []],
      ['sprint', []],
      ['component', []],
      ['epic', []],
      ['issueId', []],
      ['label', IssueStore.getLabel.map(item => ({
        text: item.labelName,
        value: item.labelId.toString(),
      }))],
    ]);
    // 表格列配置
    const columns = [
      {
        title: '任务编号',
        dataIndex: 'issueNum',
        key: 'issueNum',
        className: 'issueId',
        sorterId: 'issueId',
        disableClick: true,
        sorter: true,
        filters: columnFilter.get('issueNum'),
        render: (text, record) => <IssueNum text={text} />,
      },
      {
        title: '问题类型',
        key: 'issueTypeId',
        className: 'issueType',
        disableClick: true,
        sorterId: 'issueTypeId',
        sorter: true,
        filters: columnFilter.get('typeId'),
        filterMultiple: true,
        render: (text, record) => <TypeCode record={record} />,
      },
      {
        title: '概要',
        dataIndex: 'summary',
        className: 'summary',
        key: 'summary',
        disableClick: true,
        filters: columnFilter.get('summary'),
        render: text => <Summary text={text} />,
      },
      {
        title: '状态',
        key: 'statusId',
        className: 'status',
        disableClick: true,
        sorterId: 'statusId',
        sorter: true,
        filters: columnFilter.get('statusId'),
        filterMultiple: true,
        render: (text, record) => <StatusName record={record} />,
      },
      {
        title: '优先级',
        key: 'priorityId',
        className: 'priority',
        disableClick: true,
        sorterId: 'priorityId',
        sorter: true,
        filters: columnFilter.get('priorityId'),
        filterMultiple: true,
        render: (text, record) => <Priority record={record} />,
      },
      {
        title: '当前处理人',
        dataIndex: 'assigneeName',
        className: 'assignee',
        key: 'assignee',
        disableClick: true,
        sorterId: 'assigneeId',
        sorter: true,
        filters: columnFilter.get('assigneeName'),
        render: (text, record) => <Assignee text={text} record={record} />,
      },
      {
        title: '报告人',
        dataIndex: 'reporterName',
        key: 'reporter',
        filters: columnFilter.get('reporterName'),
        hidden: true,
      },
      {
        title: '最后更新时间',
        dataIndex: 'lastUpdateDate',
        className: 'lastUpdateDate',
        key: 'lastUpdateDate',
        sorterId: 'lastUpdateDate',
        sorter: true,
        render: text => <LastUpdateTime text={text} />,
      },
      {
        title: '版本',
        filters: columnFilter.get('versionIssueRelDTOS'),
        key: 'version',
        hidden: true,
      },
      {
        title: '冲刺',
        key: 'sprint',
        className: 'sprint',
        filters: columnFilter.get('sprint'),
        render: (text, record) => <Sprint text={text} record={record} />,
      },
      {
        title: '模块',
        key: 'component',
        filters: columnFilter.get('component'),
        hidden: true,
      },
      {
        title: '史诗',
        dataIndex: 'epicName',
        key: 'epic',
        filters: columnFilter.get('epic'),
        hidden: true,
      },
      {
        title: '标签',
        key: 'label',
        filters: columnFilter.get('label'),
        filterMultiple: true,
        hidden: true,
      },
    ];
    return (
      <Table
        rowKey={record => record.issueId}
        {...this.props}
        columns={columns}
        dataSource={IssueStore.getIssues}
        empty={(
          <EmptyBlock
            style={{ marginTop: 60, marginBottom: 60 }}
            border
            pic={pic}
            title="根据当前搜索条件没有查询到问题"
            des="尝试修改您的过滤选项或者在下面创建新的问题"
          />
        )}
        filterBarPlaceholder="过滤表"
        noFilter
        filters={IssueStore.getBarFilter}
        loading={IssueStore.getLoading}
        pagination={IssueStore.getPagination}
        footer={() => (<QuickCreateIssue />)}
        onChange={this.handleFilterChange}
        className="c7n-Issue-table"
        onRow={record => ({
          onClick: (e) => {
            e.currentTarget.style.background = 'rgba(140, 158, 255, 0.08)';
            e.currentTarget.style.borderLeft = '3px solid #3f51b5';
            IssueStore.setClickedRow({
              selectedIssue: record,
              expand: true,
            });
          },
          onBlur: (e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderLeft = 'none';
          },
        })
        }
      />
    );
  }
}

export default IssueTable;
