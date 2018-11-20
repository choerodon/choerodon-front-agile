import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  Tag, Button, Popover, Checkbox, Select,
} from 'choerodon-ui';

import BacklogStore from '../../stores/project/backlog/BacklogStore';
import './QuickSearch.scss';

const { Option, OptGroup } = Select;
const { CheckableTag } = Tag;
const { Group: CheckboxGroup } = Checkbox;
const { AppState } = stores;

// @inject('AppState')
@observer
class QuickSearch extends Component {
  static defaultProps = {
    selectionGroup: ['仅我的问题', '仅故事'],
    resetFilter: false,
  };

  static propTypes = {
    selectionGroup: PropTypes.arrayOf(PropTypes.any),
    title: PropTypes.bool,
    buttonName: PropTypes.string,
    buttonIcon: PropTypes.string,
    moreSelection: PropTypes.arrayOf(PropTypes.any),
    onChangeCheckBox: PropTypes.func,
    onlyMe: PropTypes.func,
    onlyStory: PropTypes.func,
    resetFilter: PropTypes.bool,
  };


  state = {
    quickSearchSelected: [],
    assignee: [],
  };

  componentDidMount() {
    axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users?page=0&size=9999`)
      .then((res) => {
        this.setState({
          assignee: res.content,
        });
      })
      .catch((e) => {
        Choerodon.prompt('获取经办人信息失败');
      });
  }

  handleQuickSearchChange = (value) => {
    console.log(`stathe: ${this.state.quickSearchSelected}`)
    console.log(JSON.stringify(value));
    const { onQuickSearchChange } = this.props;
    const labels = _.map(value, 'label');
    this.setState(
      {
        quickSearchSelected: _.map(value, 'key'),
      }, () => {
        console.log(`quickSearchSelected: ${JSON.stringify(this.state.quickSearchSelected)}`);
      }
    )
    onQuickSearchChange(labels.includes('仅我的问题'), labels.includes('仅故事'), _.pull(_.map(value, 'key'), '仅故事', '仅我的问题'));
    // onQuickSearchChange(value.includes('仅我的问题'), value.includes('仅故事'), _.pull(value, '仅我的问题', '仅故事'));
  }

  render() {
    const {
      title, moreSelection,
    } = this.props;
    const { quickSearchSelected } = this.state;
    const { assignee } = this.state;
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
              maxTagPlaceholder={(ommittedValues) => 
                // console.log(ommittedValues);
                 `${_.map(ommittedValues, 'label').join(', ')}`
                // return ommittedValues.join(', ')}
              }
              // value={BacklogStore.getQuickSearchClean ? `${{ key: '', value: '' }}` : JSON.stringify(quickSearchSelected[0])}
              // value={() => {
              //   if (BacklogStore.getQuickSearchClean) {
              //     return `${{ key: '', value: '' }}`;
              //   }
              // }}
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
            >
              {
                assignee && assignee.length && (
                  assignee.map(item => (
                    <Option key={item.id} value={item.realName}>{item.realName}</Option>
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
