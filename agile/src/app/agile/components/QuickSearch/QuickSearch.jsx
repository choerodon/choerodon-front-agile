import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import {
  Tag, Button, Popover, Checkbox,
} from 'choerodon-ui';
import './QuickSearch.scss';

const { CheckableTag } = Tag;
const { Group: CheckboxGroup } = Checkbox;


@inject('AppState')
@observer
class QuickSearch extends Component {
  static defaultProps = {
    selectionGroup: ['仅我的问题', '仅故事'],
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
  };

  state = {
    selected: [],
  };

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

  buttonRender = () => {
    const {
      buttonName, buttonIcon, moreSelection, onChangeCheckBox,
    } = this.props;

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
    const { title, selectionGroup } = this.props;
    const { selected } = this.state;
    return (
      <div
        className="c7n-agile-quickSearch-container"
      >
        <div
          className="c7n-agile-quickSearch-left"
        >
          {title && (<p style={{ marginRight: 24, fontSize: 14 }}>快速搜索:</p>)}
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
          {this.buttonRender()}
        </div>
      </div>
    );
  }
}

export default QuickSearch;
