import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import './TypeTag.scss';

const TYPE_MAP = {
  story: {
    icon: 'turned_in',
    bgColor: '#00bfa5',
    doneBgColor: 'rgba(0, 191, 165, 0.6)',
    name: '故事',
  },
  bug: {
    icon: 'bug_report',
    bgColor: '#f44336',
    doneBgColor: 'rgba(244, 67, 54, 0.6)',
    name: '故障',
  },
  task: {
    icon: 'assignment',
    bgColor: '#4d90fe',
    doneBgColor: 'rgba(77, 144, 254, 0.6)',
    name: '任务',
  },
  issue_epic: {
    icon: 'priority',
    bgColor: '#743be7',
    doneBgColor: 'rgba(116, 59, 231, 0.6)',
    name: '史诗',
  },
  sub_task: {
    icon: 'relation',
    bgColor: '#4d90fe',
    doneBgColor: 'rgba(77, 144, 254, 0.6)',
    name: '子任务',
  },
  issue_test: {
    icon: 'test',
    bgColor: '#ff7043',
    doneBgColor: 'rgba(255, 112, 67, 0.6)',
    name: '测试',
  },
  default: {
    icon: 'help',
    bgColor: '#fab614',
    doneBgColor: 'rgba(250, 182, 20, 0.6)',
    name: '未知类型',
  },
};

class TypeTag extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.typeCode === this.props.typeCode) {
      return false;
    }
    return true;
  }

  render() {
    const {
      typeCode, showName, tooltip, isDone,
    } = this.props;
    const currentType = TYPE_MAP[typeCode] ? TYPE_MAP[typeCode] : TYPE_MAP.default;
    return (
      <div className="c7n-typeTag">
        <div
          className="icon"
          style={{
            backgroundColor: isDone ? currentType.doneBgColor : currentType.bgColor,
          }}
        >
          <Icon
            style={{ fontSize: '14px' }}
            type={currentType.icon}
          />
        </div>
        {
          showName && (
            <span className="name">{currentType.name}</span>
          )
        }
      </div>
    );
  }
}
export default TypeTag;
