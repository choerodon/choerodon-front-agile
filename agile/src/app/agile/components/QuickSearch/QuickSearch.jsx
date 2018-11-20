import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { stores, axios } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import {
  Tag, Button, Popover, Checkbox, Select,
} from 'choerodon-ui';

import BacklogStore from '../../stores/project/backlog/BacklogStore';
import './QuickSearch.scss';

const { Option } = Select;
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
    selected: [],
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

  handleOnclickChange = (tag, checked) => {
    const { onlyStory, onlyMe } = this.props;
    switch (tag) {
      case '仅故事':
        onlyStory(checked);
        break;
      case '仅我的问题':
        onlyMe(checked);
        break;
      default:
        break;
    }
    const { selected } = this.state;
    const nextSelectedTags = checked
      ? [...selected, tag]
      : selected.filter(t => t !== tag);
    this.setState({ selected: nextSelectedTags });
  };

  buttonRender = (resetFilter) => {
    const {
      buttonName, buttonIcon, onChangeCheckBox,
    } = this.props;

    let { moreSelection } = this.props;
    if (resetFilter) {
      moreSelection = [];
    }
    const listChildren = moreSelection.map(item => ({
      label: item.name,
      value: item.filterId,
    }));
    const content = (
      <CheckboxGroup className="c7n-agile-quickSearch-popover" style={{ display: 'flex', flexDirection: 'column' }} options={listChildren} onChange={onChangeCheckBox} />
    );
    return listChildren.length ? (
      <Popover placement="bottomLeft" content={content} trigger="click">
        <Button funcType="flat" icon={buttonIcon}>{buttonName}</Button>
      </Popover>
    ) : null;
  };

  render() {
    const { title, selectionGroup, resetFilter } = this.props;
    if (resetFilter) {
      this.setState({
        selected: [],
      });
      BacklogStore.setQuickSearchClean(false);
    }
    const { selected, assignee } = this.state;
    return (
      <div
        className="c7n-agile-quickSearch-container"
      >
        <div
          className="c7n-agile-quickSearch-left"
        >
          {title && (<p style={{ marginRight: 16, fontSize: 14, fontWeight: 600 }}>快速搜索:</p>)}
          {selectionGroup.map(tag => (
            <CheckableTag
              key={tag}
              className="c7n-agile-quickSearch-tag"
              checked={selected.indexOf(tag) > -1}
              onChange={checked => this.handleOnclickChange(tag, checked)}
            >
              {tag}
            </CheckableTag>
          ))}
          {
            <div
              style={{
                paddingLeft: 7,
                paddingRight: 7,
                marginRight: 8,
              }}
            >
              <Select
                // style={{ minWidth: 160 }}
                className="assigneeSelect"
                mode="multiple"
                placeholder="经办人"
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
          {this.buttonRender(resetFilter)}
        </div>
      </div>
    );
  }
}

export default QuickSearch;
