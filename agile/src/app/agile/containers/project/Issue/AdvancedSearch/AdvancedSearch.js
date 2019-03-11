import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Select, DatePicker, Button, Modal, Tooltip, 
} from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import moment from 'moment';
import _ from 'lodash';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import IssueFilterControler from '../IssueFilterControler';

const { Option } = Select;
const { AppState } = stores;
const { RangePicker } = DatePicker;

@observer
class AdvancedSearch extends Component {
    getSearchFilter = (filterId) => {
      this.filterControler = new IssueFilterControler();
      const projectInfo = IssueStore.getProjectInfo;
      const myFilters = IssueStore.getMyFilters;
      
      if (filterId) {
        IssueStore.setIsExistFilter(true);
        IssueStore.setEmptyBtnVisible(true);
        const searchFilterInfo = myFilters.find(item => item.filterId === filterId);
        const {
          advancedSearchArgs, searchArgs, otherArgs, contents, 
        } = searchFilterInfo.personalFilterSearchDTO;
        if (otherArgs.assigneeId && otherArgs.assigneeId.includes(0)) {
          otherArgs.assigneeId = otherArgs.assigneeId.map(item => (item === 0 ? '0' : item));
        }
        IssueStore.setSelectedMyFilterInfo(searchFilterInfo);
        IssueStore.setSelectedIssueType(advancedSearchArgs.issueTypeId || []);
        IssueStore.setSelectedStatus(advancedSearchArgs.statusId || []);
        IssueStore.setSelectedPriority(advancedSearchArgs.priorityId || []);
        IssueStore.setSelectedAssignee(advancedSearchArgs.assigneeIds.concat(otherArgs.assigneeId && otherArgs.assigneeId.length > 0 ? ['none'] : []) || []);
        IssueStore.setCreateStartDate(moment(searchArgs.createStartDate).format('YYYY-MM-DD HH:mm:ss'));
        IssueStore.setCreateEndDate(moment(searchArgs.createEndDate).format('YYYY-MM-DD HH:mm:ss'));
        IssueStore.setBarFilter(contents || []);
        this.filterControler.searchArgsFilterUpdate(IssueStore.setCreateStartDate, IssueStore.getCreateEndDate);
        this.filterControler.myFilterUpdate(otherArgs, contents, searchArgs);
        this.filterControler.advancedSearchArgsFilterUpdate(IssueStore.getSelectedIssueType, IssueStore.getSelectedStatus, IssueStore.getSelectedPriority);
        this.filterControler.assigneeFilterUpdate(IssueStore.getSelectedAssignee.filter(assigneeId => assigneeId !== 'none'));
        IssueStore.updateIssues(this.filterControler, contents);
      } else {
        IssueStore.resetFilterSelect(this.filterControler);
      }
    }
  
    
    handleMyFilterSelectChange = (value) => {
      IssueStore.setSelectedFilterId((value && value.key) || undefined);
      this.getSearchFilter((value && value.key) || undefined);
    }
  
    handleIssueTypeSelectChange = (value) => {
      const selectedStatus = IssueStore.getSelectedStatus;
      const selectedPriority = IssueStore.getSelectedPriority;
      IssueStore.setSelectedIssueType(_.map(value, 'key'));
      this.filterControler = new IssueFilterControler();
      this.filterControler.advancedSearchArgsFilterUpdate(_.map(value, 'key'), selectedStatus, selectedPriority);
      IssueStore.judgeConditionWithFilter();
      IssueStore.judgeFilterConditionIsEmpty();
      IssueStore.updateIssues(this.filterControler);
    }
  
    handleStatusSelectChange = (value) => {
      const selectedIssueType = IssueStore.getSelectedIssueType;
      const selectedPriority = IssueStore.getSelectedPriority;
      IssueStore.setSelectedStatus(_.map(value, 'key'));
      this.filterControler = new IssueFilterControler();
      this.filterControler.advancedSearchArgsFilterUpdate(selectedIssueType, _.map(value, 'key'), selectedPriority);
      IssueStore.judgeConditionWithFilter();
      IssueStore.judgeFilterConditionIsEmpty();
      IssueStore.updateIssues(this.filterControler);
    }
  
    handlePrioritySelectChange = (value) => {
      const selectedIssueType = IssueStore.getSelectedIssueType;
      const selectedStatus = IssueStore.getSelectedStatus;
      IssueStore.setSelectedPriority(_.map(value, 'key'));
      this.filterControler = new IssueFilterControler();
      this.filterControler.advancedSearchArgsFilterUpdate(selectedIssueType, selectedStatus, _.map(value, 'key'));
      IssueStore.judgeConditionWithFilter();
      IssueStore.judgeFilterConditionIsEmpty();
      IssueStore.updateIssues(this.filterControler);
    }
  
    handleAssigneeSelectChange = (value) => {
      this.filterControler = new IssueFilterControler();
      IssueStore.setSelectedAssignee(_.map(value, 'key'));
      if (value.find(item => item.key === 'none')) {
        this.filterControler.assigneeFilterUpdate([]);
        this.filterControler.cache.get('userFilter').otherArgs.assigneeId = ['0'].concat(_.map(_.filter(value, item => item.key !== 'none'), 'key'));
        // IssueStore.setFilterMap(this.filterControler.cache);
      } else {
        if (!this.filterControler.cache.get('userFilter').otherArgs) {
          this.filterControler.cache.get('userFilter').otherArgs = {};
        }
        this.filterControler.cache.get('userFilter').otherArgs.assigneeId = [];
        // IssueStore.setFilterMap(this.filterControler.cache);
        this.filterControler.assigneeFilterUpdate(_.map(value, 'key'));
      }
      IssueStore.judgeFilterConditionIsEmpty();
      IssueStore.judgeConditionWithFilter();
      IssueStore.updateIssues(this.filterControler);
    }
    
    handleCreateDateRangeChange = (dates) => {
      if (dates.length) {
        const createStartDate = `${moment(dates[0]).format('YYYY-MM-DD')} 00:00:00`;
        const createEndDate = `${moment(dates[1]).format('YYYY-MM-DD')} 23:59:59`;
        IssueStore.setCreateStartDate(createStartDate);
        IssueStore.setCreateEndDate(createEndDate);
      } else {
        const projectInfo = IssueStore.getProjectInfo;
        IssueStore.setCreateStartDate(`${moment(projectInfo.creationDate).format('YYYY-MM-DD')} 00:00:00`);
        IssueStore.setCreateEndDate(`${moment().format('YYYY-MM-DD')} 23:59:59`);
      }
      IssueStore.setSaveFilterVisible(false);
      this.filterControler = new IssueFilterControler();
      this.filterControler.searchArgsFilterUpdate(IssueStore.getCreateStartDate, IssueStore.getCreateEndDate);
      IssueStore.judgeConditionWithFilter();
      IssueStore.judgeFilterConditionIsEmpty();
      IssueStore.updateIssues(this.filterControler);
    }
    

    deBounce = (delay) => {
      let timeout;
      return (fn, that) => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        timeout = setTimeout(fn, delay, that);// (自定义函数，延迟时间，自定义函数参数1，参数2)
      };
    };
   
    render() {
      const editFilterInfo = IssueStore.getEditFilterInfo;
      const projectInfo = IssueStore.getProjectInfo;
      const issueTypes = IssueStore.getIssueTypes;
      const statusLists = IssueStore.getIssueStatus;
      const prioritys = IssueStore.getIssuePriority;
      const users = IssueStore.getUsers;
      const selectedIssueType = IssueStore.getSelectedIssueType;
      const selectedStatus = IssueStore.getSelectedStatus;
      const selectedPriority = IssueStore.getSelectedPriority;
      const selectedAssignee = IssueStore.getSelectedAssignee;
      const createStartDate = IssueStore.getCreateStartDate;
      const createEndDate = IssueStore.getCreateEndDate;
      const selectedMyFilterInfo = IssueStore.getSelectedMyFilterInfo;
      const selectedFilterId = IssueStore.getSelectedFilterId;
      const isExistFilter = IssueStore.getIsExistFilter;
      const myFilters = IssueStore.getMyFilters;
      const filterListVisible = IssueStore.getFilterListVisible;
      const emptyBtnVisible = IssueStore.getEmptyBtnVisible;
      const filterControler = new IssueFilterControler();

      const debounceCallback = this.deBounce(500);
      return (
        <div className="c7n-mySearch">
          <div style={{ display: 'flex' }}>
            <Select
              key="myFilterSelect"
              className="myFilterSelect"
              allowClear
              dropdownClassName="myFilterSelect-dropdown"
              dropdownMatchSelectWidth={false}
              placeholder="我的筛选"
              labelInValue
              maxTagCount={0}
              maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
              filter
              optionFilterProp="children"
              onChange={this.handleMyFilterSelectChange}
              value={selectedFilterId ? { key: selectedFilterId, label: selectedMyFilterInfo.name } : undefined}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              {
                myFilters.length && myFilters.map(item => (
                  <Option key={item.filterId} value={item.filterId} title={item.name}>{item.name}</Option>
                ))
              }
            </Select>

            <Select
              key="issueTypeSelect"
              className="issueTypeSelect"
              mode="multiple"
              allowClear
              dropdownClassName="issueTypeSelect-dropdown"
              dropdownMatchSelectWidth={false}
              placeholder="问题类型"
              labelInValue
              maxTagCount={0}
              maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
              onChange={this.handleIssueTypeSelectChange}
              value={_.map(selectedIssueType, key => (
                {
                  key,
                  name: _.map(issueTypes, item => item.id === key).name,
                }
              ))}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              {
                issueTypes.length && issueTypes.map(item => (
                  <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                ))
              }
            </Select>

            <Select
              key="statusSelect"
              className="statusSelect"
              mode="multiple"
              allowClear
              dropdownClassName="statusSelect-dropdown"
              dropdownMatchSelectWidth={false}
              placeholder="状态"
              labelInValue
              maxTagCount={0}
              maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
              onChange={this.handleStatusSelectChange}
              value={_.map(selectedStatus, key => (
                {
                  key,
                  name: _.map(statusLists, item => item.id === key).name,
                }
              ))}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              {
                statusLists.length && statusLists.map(item => (
                  <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                ))
              }
            </Select>

            <Select
              key="prioritySelect"
              className="prioritySelect"
              mode="multiple"
              dropdownClassName="prioritySelect-dropdown"
              dropdownMatchSelectWidth={false}
              allowClear
              placeholder="优先级"
              labelInValue
              maxTagCount={0}
              maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
              onChange={this.handlePrioritySelectChange}
              value={_.map(selectedPriority, key => (
                {
                  key,
                  name: _.map(prioritys, item => item.id === key).name,
                }
              ))}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              {
                prioritys.length && prioritys.map(item => (
                  <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                ))
              }
            </Select>

            <Select
              key="assigneeSelect"
              className="assigneeSelect"
              mode="multiple"
              allowClear
              dropdownClassName="assigneeSelect-dropdown"
              dropdownMatchSelectWidth={false}
              placeholder="经办人"
              labelInValue
              maxTagCount={0}
              maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
              filter
              optionFilterProp="children"
              onFilterChange={(value) => {
                if (value) {
                  debounceCallback(() => {
                    axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users?size=40&param=${value}`).then((res) => {
                      // Set 用于查询是否有 id 重复的，没有重复才往里加
                      const temp = new Set(users.map(item => item.id));
                      res.content.filter(item => item.enabled).forEach((item) => {
                        if (!temp.has(item.id)) {
                          // users.push({
                          //   id: item.id,
                          //   realName: item.realName,
                          // });
                          users.push(item);
                        }
                      });
                     
                      IssueStore.setUsers(users);
                    });
                  }, this);
                }
              }}
              onChange={this.handleAssigneeSelectChange}
              value={_.map(selectedAssignee, (key) => {
                if (key === 'none') {
                  return ({
                    key,
                    label: '未分配',
                  });
                } else {
                  return ({
                    key,
                    label: _.find(users, item => item.id === key).realName,
                  });
                }
              })}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              {
                users.length && users.map(item => (
                  <Option key={item.id} value={item.id} title={item.realName}>{item.realName}</Option>
                ))
              }
            </Select>
            
            <Tooltip title={`创建问题时间范围为${moment(createStartDate).format('YYYY-MM-DD')} ~ ${moment(createEndDate).format('YYYY-MM-DD')}`}>
              <div className="c7n-createRange">

                <RangePicker
                  value={[moment(createStartDate), moment(createEndDate)]}
                  format="YYYY-MM-DD hh:mm:ss"
                  allowClear={moment(createStartDate).format('YYYY-MM-DD') !== moment(projectInfo.creationDate).format('YYYY-MM-DD') || moment(createEndDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')}
                // ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
                  onChange={this.handleCreateDateRangeChange}
                  placeholder={['创建时间', '']}
                />
              </div>

            </Tooltip>
          </div>
          <div className="c7n-mySearchManage">
            {
              emptyBtnVisible && (
              <Button 
                funcType="raised" 
                style={{ color: '#fff', background: '#3F51B5', marginRight: 10 }}
                onClick={() => {
                  IssueStore.setSaveFilterVisible(false);
                  IssueStore.setFilterListVisible(false);
                  IssueStore.resetFilterSelect(filterControler);
                }}
              >
                {'清空筛选'}
              </Button>
              )
            }
            {
              !isExistFilter && (
              <Button 
                funcType="raised" 
                style={{ color: '#fff', background: '#3F51B5', marginRight: 10 }}
                onClick={() => {
                  IssueStore.setSaveFilterVisible(true);
                  IssueStore.setFilterListVisible(false);
                }}
              >
                {'保存筛选'}
              </Button>
              )
            }
            {myFilters && myFilters.length > 0 && (
              <Button 
                funcType="flat" 
                style={{ color: '#3F51B5' }}
                onClick={() => {
                  IssueStore.setSaveFilterVisible(false);
                  IssueStore.setFilterListVisible(!filterListVisible);
                }}
              >
                {'筛选管理'}
              </Button>
            )}
          </div>
        </div>
       
      );
    }
}

export default AdvancedSearch;
