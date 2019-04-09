import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'choerodon-ui';
import FiltersProvider from '../../../../../components/FiltersProvider';
import {
  IssueNum, TypeCode, Summary, StatusName, Priority, Assignee, LastUpdateTime, Sprint, Epic,
} from '../../../../project/Issue/IssueTable/IssueTableComponent';
import { QuickCreateFeatureWithProvider } from '../../../../../components/QuickCreateFeature';
import './FeatureTable.scss';

const getColumns = filters => ([
  {
    title: '编号',
    dataIndex: 'issueNum',
    key: 'issueNum',
    className: 'issueId',
    sorterId: 'issueId',
    width: 100,
    sorter: true,
    filters: [],
    render: text => <IssueNum text={text} />,
  },
  {
    title: '特性类型',
    key: 'futureType',
    className: 'futureType',
    sorterId: 'futureType',
    width: 100,
    render: (text, record) => (
      <div style={{ lineHeight: 0 }}>
        {text}
      </div>
    ),
  },
  {
    title: '概要',
    dataIndex: 'summary',
    className: 'summary',
    key: 'summary',
    width: 240,
    filters: [],
    render: text => <Summary text={text} />,
  },
  {
    title: '状态',
    key: 'statusId',
    className: 'status',
    sorterId: 'statusId',
    width: 100,
    sorter: true,
    filters: filters.issueStatus,
    filterMultiple: true,
    render: (text, record) => <StatusName record={record} />,
  },
  {
    title: '最后更新时间',
    dataIndex: 'lastUpdateDate',
    className: 'lastUpdateDate',
    key: 'lastUpdateDate',
    sorterId: 'lastUpdateDate',
    width: 134,
    sorter: true,
    render: text => <LastUpdateTime text={text} />,
  },
]);

const FeatureTable = ({
  loading,
  dataSource,
  pagination,
  onChange,
  onRow,
  onCreateFeature,
}) => (
  <FiltersProvider fields={[{ key: 'issueStatus', args: ['program'] }]}>
    {
      filters => (
        <div className="c7nagile-FeatureTable">
          <Table
            loading={loading}
            columns={getColumns(filters)}
            pagination={pagination}
            dataSource={dataSource}
            onChange={onChange}
            onRow={onRow}
            footer={() => (<QuickCreateFeatureWithProvider onCreate={onCreateFeature} />)}
          />
        </div>
      )}
  </FiltersProvider>
);

FeatureTable.propTypes = {

};

export default FeatureTable;
