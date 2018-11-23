import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  Tag, Button, Popover, Checkbox, Select,
} from 'choerodon-ui';

import BacklogStore from '../../stores/project/backlog/BacklogStore';
import ScrumBoardStore from '../../stores/project/scrumBoard/ScrumBoardStore';
import IssueStore from '../../stores/project/sprint/IssueStore';
import UserMapStore from '../../stores/project/userMap/UserMapStore';
import './QuickSearch.scss';

const quickSearchStores = {
  BacklogStore, ScrumBoardStore, IssueStore, UserMapStore, 
};

const { Option, OptGroup } = Select;
const { AppState } = stores;

@observer
class QuickSearch extends Component {
  static propTypes = {
    title: PropTypes.bool,
    moreSelection: PropTypes.arrayOf(PropTypes.any),
  };

  handleQuickSearchChange = (value) => {
    const { onQuickSearchChange } = this.props;
    const labels = _.map(value, 'label');
    onQuickSearchChange(labels.includes('仅我的问题'), labels.includes('仅故事'), _.pull(_.map(value, 'key'), '仅故事', '仅我的问题'));
  }

  handleAssigneeChange = (value) => {
    const { onAssigneeChange, pageFlag } = this.props;
    if (pageFlag !== 'Issue') {
      quickSearchStores[`${pageFlag}Store`].setAssigneeFilterIds(_.map(value, 'key'));
    }
    onAssigneeChange(value);
  }

  render() {
    const {
      title, moreSelection, assignee,
    } = this.props;
    const listChildren = moreSelection.map(item => ({
      label: item.name,
      value: item.filterId,
    }));

    return (
      <div
        className="c7n-agile-quickSearch-container"
      >

        <div
          className="c7n-agile-quickSearch-left"
        >
          {title && (<p style={{ marginRight: 16, fontSize: 14, fontWeight: 600 }}>搜索:</p>)}
          <div>
            <Select
              allowClear
              key="quickSearchSelect"
              className="quickSearchSelect"
              style={{ minWidth: 70, marginRight: 15 }}
              dropdownClassName="quickSearchDropDown"
              mode="multiple"
              labelInValue
              placeholder="快速搜索"
              maxTagCount={0}
              maxTagPlaceholder={ommittedValues => `${_.map(ommittedValues, 'label').join(', ')}`
              }
              onChange={this.handleQuickSearchChange}
            >
              {
                <OptGroup key="quickSearch">
                  <Option key={-1} value="仅我的问题">仅我的问题</Option>
                  <Option key={-2} value="仅故事">仅故事</Option>
                </OptGroup>
              }
              <OptGroup key="more" label="更多">
                {
                listChildren.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)
              }
              </OptGroup>
            </Select>
          </div>
         
        </div>
        {
          <div
            style={{
              paddingLeft: 4,
              paddingRight: 4,
            }}
          >
            <Select
              allowClear
              key="assigneeSelect"
              className="assigneeSelect"
              mode="multiple"
              placeholder="经办人"
              maxTagCount={0}
              maxTagPlaceholder={ommittedValues => `经办人：${_.map(ommittedValues, 'label').join(', ')}`}
              labelInValue
              filter
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children.toLowerCase()
                .indexOf(input.toLowerCase()) >= 0}
              onChange={this.handleAssigneeChange}
            >
              {
                assignee && assignee.length && (
                  assignee.map(item => (
                    <Option key={item.id} value={item.id}>{item.realName}</Option>
                  ))
                )
              }
            </Select>
          </div>
          }
      </div>
    );
  }
}

export default QuickSearch;
