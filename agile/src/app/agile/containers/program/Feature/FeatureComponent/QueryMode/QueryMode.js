import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FetureTable from '../FeatureTable';
import SearchArea from '../SearchArea';
import { getFeatures } from '../../../../../api/FeatureApi';
import FeatureStore from '../../../../../stores/program/Feature/FeatureStore';
import { getMyFilters } from '../../../../../api/NewIssueApi';

const getDefaultSearchDTO = () => ({
  advancedSearchArgs: {
    assigneeIds: [],
    statusList: [],
    reporterList: [],
    epicList: [],
  },
  // content: '',
  otherArgs: {
    piList: [],
  },
  searchArgs: {},
  // searchArgs: {
  //   assignee: '',
  //   component: '',
  //   epic: '',
  //   issueNum: '',
  //   sprint: '',
  //   summary: '',
  //   version: '',
  // },
});
const filterConvert = (filters) => {
  const searchDTO = getDefaultSearchDTO();
  const setArgs = (field, filter) => {
    Object.assign(searchDTO[field], filter);
  };
  // 循环遍历 Object 中的每个键
  Object.keys(filters).forEach((key) => {
    // 根据对应的 key 传入对应的 mode
    switch (key) {
      case 'assigneeIds':
      case 'statusList':
      case 'reporterList':
      case 'epicList':
        setArgs('advancedSearchArgs', { [key]: filters[key] });
        break;
      case 'piList':
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
  state = {
    loading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
    searchDTO: getDefaultSearchDTO(),
    issues: [],
    myFilters: [],
    createMyFilterVisible: false,
    filterManageVisible: false,
    selectedFilter: undefined,
  }

  advancedFilters = {}

  tableFilters = {}

  componentDidMount() {
    this.refresh();
  }

  componentWillUnmount() {
    FeatureStore.setClickIssueDetail({});
  }

  refresh = () => {
    this.loadFeatures();
    this.loadMyFilters();
  }

  loadMyFilters = () => {
    getMyFilters().then((myFilters) => {
      this.setState({
        myFilters,
      });
    });
  }

  handleCreateMyFilterCancel = () => {
    this.setState({
      createMyFilterVisible: false,
    });
  }

  handleSaveClick = () => {
    this.setState({
      createMyFilterVisible: true,
    });
  }

  handleCreateMyFilter = () => {
    this.setState({
      createMyFilterVisible: false,
    });
    this.loadMyFilters();
  }

  handleSelectMyFilter = (filterId) => {
    const { myFilters } = this.state;
    const targetFilter = myFilters.find(filter => filter.filterId === filterId);

    if (targetFilter) {
      const { filterJson } = targetFilter;
      this.setState({
        searchDTO: JSON.parse(filterJson),
        selectedFilter: filterId,
      },
      this.loadFeatures);
    } else {
      this.setState({
        searchDTO: getDefaultSearchDTO(),
        selectedFilter: filterId,
      },
      this.loadFeatures);
    }
  }

  handleManageClick = () => {
    this.setState({
      filterManageVisible: true,
    });
  }

  handleManageClose = () => {
    this.setState({
      filterManageVisible: false,
    });
  }

  // eslint-disable-next-line react/destructuring-assignment
  loadFeatures = ({ pagination = this.state.pagination, searchDTO = this.state.searchDTO } = {}) => {
    const { current, pageSize } = pagination;
    this.setState({
      loading: true,
    });
    getFeatures({
      page: current - 1,
      size: pageSize,
    }, searchDTO).then((res) => {
      const {
        content: issues, size, number, totalElements,
      } = res;
      this.setState({
        pagination: {
          current: number + 1,
          total: totalElements,
          pageSize: size,
        },
        issues,
        loading: false,
      });
    });
  }


  handleAdvancedSearchChange = (type, values) => {
    this.advancedFilters[type] = values;
    this.reSearch();
  }

  handleTableChange = (pagination, filters) => {
    this.tableFilters = filters;
    this.reSearch(pagination);
  }

  reSearch = (pagination) => {
    const searchDTO = filterConvert({ ...this.advancedFilters, ...this.tableFilters });
    this.loadFeatures({ pagination, searchDTO });
    this.setState({
      selectedFilter: null,
      searchDTO,
    });
  }

  handleRow = record => ({
    onClick: (event) => { this.handleTableRowClick(record); },
  })

  handleTableRowClick = (record) => {
    FeatureStore.setClickIssueDetail(record);
  }

  handleCreateFeature = () => {
    this.refresh();
  }


  handleClearFilter = () => {
    this.advancedFilters = {};
    this.tableFilters = {};
    this.reSearch();
  }

  render() {
    const {
      pagination, loading, issues, searchDTO, myFilters, selectedFilter, createMyFilterVisible, filterManageVisible,
    } = this.state;
    return (
      <div style={{ flex: 1, height: '100%', overflow: 'auto' }}>
        <SearchArea
          createMyFilterVisible={createMyFilterVisible}
          filterManageVisible={filterManageVisible}
          myFilters={myFilters}
          searchDTO={searchDTO}
          selectedFilter={selectedFilter}
          onAdvancedSearchChange={this.handleAdvancedSearchChange}
          onSelectMyFilter={this.handleSelectMyFilter}
          onClearFilter={this.handleClearFilter}
          onCancel={this.handleCreateMyFilterCancel}
          onCreate={this.handleCreateMyFilter}
          onSaveClick={this.handleSaveClick}      
          onManageClick={this.handleManageClick}
          onClose={this.handleManageClose}
        />
        <FetureTable
          loading={loading}
          dataSource={issues}
          pagination={pagination}
          onChange={this.handleTableChange}
          onRow={this.handleRow}
          onCreateFeature={this.handleCreateFeature}
        />
      </div>
    );
  }
}

QueryMode.propTypes = {

};

export default QueryMode;
