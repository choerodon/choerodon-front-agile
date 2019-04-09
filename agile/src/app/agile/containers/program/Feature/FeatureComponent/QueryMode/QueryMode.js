import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FetureTable from '../FeatureTable';

const filterConvert = (filters) => {
  const searchDTO = {    
    advancedSearchArgs: {
      statusId: [],
      priorityId: [],
      issueTypeId: [],
    },
    content: '',
    otherArgs: {
      component: [],
      epic: [],
      issueIds: [],
      label: [],
      reporter: [],
      summary: [],
      version: [],
      sprint: [],
    },
    searchArgs: {
      assignee: '',
      component: '',
      epic: '',
      issueNum: '',
      sprint: '',
      summary: '',
      version: '',
    },
  };
  const setArgs = (field, filter) => {
    Object.assign(searchDTO[field], filter);
  };
  // 循环遍历 Object 中的每个键
  Object.keys(filters).forEach((key) => {
    // 根据对应的 key 传入对应的 mode
    switch (key) {
      case 'statusId':
      case 'priorityId':
      case 'issueTypeId':           
        setArgs('advancedSearchArgs', { [key]: filters[key] });
        break;
      case 'label':
      case 'component':
      case 'version':
      case 'epic':
      case 'sprint':       
        setArgs('otherArgs', { [key]: filters[key] });
        break;
      default:
        setArgs('searchArgs', {
          [key]: filters[key][0],
        });
        break;
    }
  });
  return searchDTO;
};
class QueryMode extends Component {
  state={
    loading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
    filters: {},
  }

  componentDidMount() {
    this.loadFeatures();
  }

  // eslint-disable-next-line react/destructuring-assignment
  loadFeatures=({ pagination = this.state.pagination, filters = this.state.filters } = {}) => {
    this.setState({
      loading: true,
    });
  }

  handleTableChange=(pagination, filters) => {
    const searchDTO = filterConvert(filters);
    // console.log(searchDTO);
    this.setState({
      filters,
    });
  }

  handleTableRowClick=(record) => {

  }

  handleCreateFeature=() => {
    this.loadFeatures();
  }

  render() {
    const { pagination, loading } = this.state;
    return (
      <div style={{ flex: 1 }}>
        <FetureTable
          loading={loading}
          pagination={pagination}
          onChange={this.handleTableChange}
          onRow={record => ({
            onClick: (event) => { this.handleTableRowClick(record); },
          })}
          onCreateFeature={this.handleCreateFeature}
        />
      </div>
    );
  }
}

QueryMode.propTypes = {

};

export default QueryMode;
