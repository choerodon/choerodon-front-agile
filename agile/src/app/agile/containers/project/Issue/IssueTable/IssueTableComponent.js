import React from 'react';
import { Tooltip, Tag } from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import TypeTag from '../../../../components/TypeTag/TypeTag';
import StatusTag from '../../../../components/StatusTag/StatusTag';
import UserHead from '../../../../components/UserHead/UserHead';
import PriorityTag from '../../../../components/PriorityTag/PriorityTag';

/**
 * 任务编号呈现
 * @param props => text（任务编号信息）
 * @returns React 函数式组件
 */
export function IssueNum(props) {
  const { text } = props;
  return (
    <Tooltip mouseEnterDelay={0.5} title={`任务编号： ${text}`}>
      <a>
        {text}
      </a>
    </Tooltip>
  );
}

/**
 * 任务类型呈现
 * @param props => 任务类型对象
 * @returns React 函数式组件
 */
export function TypeCode(props) {
  const { record } = props;
  return (
    <TypeTag
      data={record.issueTypeDTO}
      showName={record.issueTypeDTO.name}
    />
  );
}

/**
 * 任务概要呈现
 * @param props => 任务概要信息
 * @returns React 函数式组件
 */
export function Summary(props) {
  const { text } = props;
  return (
    <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${text}`}>
      <span className="c7n-Issue-summary">
        {text}
      </span>
    </Tooltip>
  );
}

/**
 * 任务优先级呈现
 * @param props => 任务优先级对象
 * @returns React 函数式组件
 */
export function Priority(props) {
  const { record } = props;
  return (
    <Tooltip mouseEnterDelay={0.5} title={`优先级： ${record.priorityDTO ? record.priorityDTO.name : ''}`}>
      <PriorityTag
        priority={record.priorityDTO}
      />
    </Tooltip>
  );
}

/**
 * 任务状态呈现
 * @param props => 任务状态对象
 * @returns React 函数式组件
 */
export function StatusName(props) {
  const { record } = props;
  return (
    <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${record.statusMapDTO.name}`}>
      <StatusTag
        data={record.statusMapDTO}
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      />
    </Tooltip>
  );
}

/**
 * 任务经办人呈现
 * @param props => 任务经办人对象，任务经办人信息
 * @returns React 函数式组件
 */
export function Assignee(props) {
  const { text, record } = props;
  return (
    <Tooltip mouseEnterDelay={0.5} title={`经办人： ${text}`}>
      <div style={{ marginRight: 12 }}>
        <UserHead
          user={{
            id: record.assigneeId,
            loginName: '',
            realName: text,
            avatar: record.assigneeImageUrl,
          }}
        />
      </div>
    </Tooltip>
  );
}

/**
 * 临近更新时间呈现
 * @param props => 更新时间信息
 * @returns React 函数式组件
 */
export function LastUpdateTime(props) {
  const { text } = props;
  return (
    <Tooltip mouseEnterDelay={0.5} title={`日期： ${text}`}>
      <div style={{ width: '150px' }}>
        <TimeAgo
          datetime={text}
          locale="zh_CN"
        />
      </div>
    </Tooltip>
  );
}

/**
 * 冲刺呈现
 * @param props => 冲刺对象
 * @returns React 函数式组件
 */
export function Sprint(props) {
  const { record } = props;
  if (record.issueSprintDTOS) {
    if (record.issueSprintDTOS.length > 0) {
      return record.issueSprintDTOS.length > 1
        ? (
          <div style={{ display: 'flex' }}>
            <Tag
              color="blue"
              style={{
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.issueSprintDTOS[0].sprintName}
            </Tag>
            <Tag color="blue">...</Tag>
          </div>
        )
        : (
          <Tag
            color="blue"
            style={{
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {record.issueSprintDTOS[0].sprintName}
          </Tag>
        );
    }
  }
  return null;
}
