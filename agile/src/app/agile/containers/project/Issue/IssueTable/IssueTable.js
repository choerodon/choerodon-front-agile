import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import {
  IssueNum, TypeCode, Summary, StatusName, Priority, Assignee, LastUpdateTime, Sprint,
} from './IssueTableComponent';
import EmptyBlock from '../../../../components/EmptyBlock';
import pic from '../../../../assets/image/emptyIssue.svg';

class IssueTable extends PureComponent {
  componentDidMount() {

  }

  componentWillUnmount() {
    IssueStore.setClickedRow({
      selectedIssue: {},
      expand: false,
    });
  }

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    Object.keys(filters).forEach((key) => {
      if (key === 'statusId' || key === 'priorityId' || key === 'issueTypeId') {
        IssueStore.setAdvArg(filters);
      } else if (key === 'label') {
        IssueStore.setOtherArgs(filters);
      } else if (key === 'issueId') {
        // 根据接口进行对象调整
        IssueStore.setArg({ issueNum: filters[key][0] });
      } else if (key === 'assigneeId') {
        // 同上
        IssueStore.setArg({ assignee: filters[key][0] });
      } else {
        const temp = {
          [key]: filters[key][0],
        };
        IssueStore.setArg(temp);
      }
    });
    if (IssueStore.getParamName) {
      if (barFilters.indexOf(IssueStore.getParamName) === -1) {
        IssueStore.resetOtherArgs();
      }
    }
    IssueStore.setBarFilters(barFilters);
    // this.setState({
    //   filterName: barFilters,
    // });
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.setOrder(sorter.columnKey, sorter.order === 'ascend' ? 'asc' : 'desc');
    IssueStore.loadIssues(current - 1, pageSize);
  };

  render() {
    const { data, filter } = this.props;
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
        key: 'issueId',
        className: 'issueId',
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
        sorter: true,
        filters: columnFilter.get('priorityId'),
        filterMultiple: true,
        render: (text, record) => <Priority record={record} />,
      },
      {
        title: '当前处理人',
        dataIndex: 'assigneeName',
        className: 'assignee',
        key: 'assigneeId',
        disableClick: true,
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
        hidden: true,
      },
    ];
    return (
      <Table
        // rowKey={record => record.issueId}
        {...this.props}
        columns={columns}
        dataSource={data}
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
        filters={filter}
        noFilter
        // loading={IssueStore.loading}
        pagination={false}
        onChange={this.handleFilterChange}
        className="c7n-Issue-table"
        onRow={record => ({
          onClick: (e) => {
            e.currentTarget.style.background = 'rgba(140, 158, 255, 0.08)';
            e.currentTarget.style.borderLeft = '3px solid #3f51b5';
            // e.currentTarget.toggleAttribute()
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
