import React, { Component } from 'react';
import { Table } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { trace } from 'mobx';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import IssueFilterControler from '../IssueFilterControler';
import {
  IssueNum, TypeCode, Summary, StatusName, Priority, Assignee, LastUpdateTime, Sprint,
} from './IssueTableComponent';
import EmptyBlock from '../../../../components/EmptyBlock';
import pic from '../../../../assets/image/emptyIssue.svg';
import QuickCreateIssue from '../QuickCreateIssue/QuickCraeteIssue';

@observer
class IssueTable extends Component {
  constructor(props) {
    super(props);
    this.filterControler = new IssueFilterControler();
  }

  componentWillUnmount() {
    IssueStore.setClickedRow({
      selectedIssue: {},
      expand: false,
    });
  }

  /**
   * @param filters => Object => Table 传入的 filter
   * @param setArgs => function => 设置参数时需要调用的闭包函数
   */
  filterConvert = (filters, setArgs) => {
    // 循环遍历 Object 中的每个键
    Object.keys(filters).forEach((key) => {
      // 根据对应的 key 传入对应的 mode
      switch (key) {
        case 'statusId':
        case 'priorityId':
        case 'issueTypeId':
          setArgs('advArgs', filters);
          break;
        case 'label':
          setArgs('otherArgs', filters);
          break;
        default:
          setArgs('searchArgs', {
            [key]: filters[key][0],
          });
          break;
      }
    });
  };

  /**
   *
   * @param barFilters => Array => Table Filter 生成的 barFilter，模糊搜索和 filter 受控会使用到
   * @param setArgs => function => 设置参数时会调用到的闭包函数
   */
  barFilterConvert = (barFilters, setArgs) => {
    // 复制 Array
    const temp = barFilters.slice();
    // 如果 paramFilter 在当前 barFilter 中能找到，则不调用模糊搜索
    if (barFilters.indexOf(IssueStore.getParamFilter) !== -1) {
      temp.shift();
    }
    setArgs('content', {
      content: temp.join(''),
    });
  };

  /**
   * Table 默认的 filter 处理函数
   * @param pagination => Object => 分页对象
   * @param filters => Object => Table 筛选对象
   * @param sorter => Object => 排序对象
   * @param barFilters => Object => filter 受控对象
   */
  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    const setArgs = this.filterControler.initArgsFilter();
    this.filterConvert(filters, setArgs);
    this.barFilterConvert(barFilters, setArgs);
    IssueStore.setLoading(true);
    // 更新函数
    this.filterControler.update(
      pagination.current - 1,
      pagination.pageSize,
      sorter,
      barFilters,
    ).then(
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
    // Table 列配置
    const columns = [
      {
        title: '任务编号',
        dataIndex: 'issueNum',
        key: 'issueNum',
        className: 'issueId',
        sorterId: 'issueId',
        disableClick: true,
        sorter: true,
        filters: [],
        render: (text, record) => <IssueNum text={text} />,
      },
      {
        title: '问题类型',
        key: 'issueTypeId',
        className: 'issueType',
        disableClick: true,
        sorterId: 'issueTypeId',
        sorter: true,
        filters: IssueStore.getColumnFilter.get('typeId'),
        filterMultiple: true,
        render: (text, record) => <TypeCode record={record} />,
      },
      {
        title: '概要',
        dataIndex: 'summary',
        className: 'summary',
        key: 'summary',
        disableClick: true,
        filters: [],
        render: text => <Summary text={text} />,
      },
      {
        title: '状态',
        key: 'statusId',
        className: 'status',
        disableClick: true,
        sorterId: 'statusId',
        sorter: true,
        filters: IssueStore.getColumnFilter.get('statusId'),
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
        filters: IssueStore.getColumnFilter.get('priorityId'),
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
        filters: [],
        render: (text, record) => <Assignee text={text} record={record} />,
      },
      {
        title: '报告人',
        dataIndex: 'reporterName',
        key: 'reporter',
        filters: [],
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
        filters: [],
        key: 'version',
        hidden: true,
      },
      {
        title: '冲刺',
        key: 'sprint',
        className: 'sprint',
        filters: [],
        render: (text, record) => <Sprint text={text} record={record} />,
      },
      {
        title: '模块',
        key: 'component',
        filters: [],
        hidden: true,
      },
      {
        title: '史诗',
        dataIndex: 'epicName',
        key: 'epic',
        filters: [],
        hidden: true,
      },
      {
        title: '标签',
        key: 'label',
        filters: IssueStore.getColumnFilter.get('label'),
        filterMultiple: true,
        hidden: true,
      },
    ];
    // 表格列配置
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
            // 点击时设置当前点击元素 style
            e.currentTarget.style.background = 'rgba(140, 158, 255, 0.08)';
            e.currentTarget.style.borderLeft = '3px solid #3f51b5';
            IssueStore.setClickedRow({
              selectedIssue: record,
              expand: true,
            });
          },
          onBlur: (e) => {
            // 失焦时设置当前点击元素 style
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
