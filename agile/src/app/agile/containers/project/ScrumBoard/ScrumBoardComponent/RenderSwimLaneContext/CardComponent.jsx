import React, { Component } from 'react';
import { Tooltip, Icon, Rate } from 'choerodon-ui';
import TypeTag from '../../../../../components/TypeTag/TypeTag';
import UserHead from '../../../../../components/UserHead/UserHead';

/**
 * 任务编号呈现
 * @returns React 函数式组件
 * @param issueTypeDTO
 */
export function CardTypeTag({ issueTypeDTO }) {
  return (
    <Tooltip title={issueTypeDTO ? issueTypeDTO.name : ''}>
      <TypeTag
        data={issueTypeDTO}
      />
    </Tooltip>
  );
}

/**
 * 任务类型呈现
 * @returns React 函数式组件
 * @param issueNum
 * @param completed
 */
export function IssueNum({ issueNum, completed }) {
  return (
    <p
      style={{ marginLeft: 5, textDecoration: completed ? 'line-through' : '' }}
      className="textDisplayOneColumn"
    >
      {issueNum}
    </p>
  );
}

/**
 * 任务概要呈现
 * @returns React 函数式组件
 * @param stayDay
 * @param completed
 */
export function StayDay({ stayDay, completed }) {
  const convertedDay = (parameters) => {
    if (parameters >= 0 && parameters <= 6) {
      return 1;
    } else if (parameters >= 7 && parameters <= 10) {
      return 2;
    } else if (parameters >= 11 && parameters <= 15) {
      return 3;
    } else {
      return 4;
    }
  };
  return stayDay >= 3 && !completed ? (
    <Tooltip title={`卡片停留 ${stayDay} 天`}>
      <div>
        <Rate
          character={<Icon type="brightness_1" />}
          allowHalf
          disabled
          value={convertedDay(stayDay)}
          count={4}
          className={stayDay <= 3 ? 'notEmergency' : 'emergency'}
        />
      </div>
    </Tooltip>
  ) : '';
}

/**
 * 任务优先级呈现
 * @returns React 函数式组件
 * @param priorityDTO
 */
export function Priority({ priorityDTO }) {
  return (
    <Tooltip title={`优先级: ${priorityDTO && priorityDTO.name}`}>
      <p
        style={{
          background: `${priorityDTO ? priorityDTO.colour : '#FFFFFF'}1F`,
          color: priorityDTO ? priorityDTO.colour : '#FFFFFF',
          textAlign: 'center',
          marginLeft: '8px',
          minWidth: 16,
          maxWidth: 46,
          paddingLeft: 2,
          paddingRight: 2,
          height: 20,
          borderRadius: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {priorityDTO && priorityDTO.name}
      </p>
    </Tooltip>
  );
}

/**
 * 任务状态呈现
 * @returns React 函数式组件
 * @param statusName
 * @param categoryCode
 */
export function StatusName({ categoryCode, statusName }) {
  const renderStatusBackground = (parameters) => {
    if (parameters === 'todo') {
      return 'rgb(255, 177, 0)';
    } else if (parameters === 'doing') {
      return 'rgb(77, 144, 254)';
    } else if (parameters === 'done') {
      return 'rgb(0, 191, 165)';
    } else {
      return 'gray';
    }
  };
  return (
    <Tooltip title={`状态: ${statusName}`}>
      <p
        style={{
          borderRadius: 2,
          paddingLeft: 4,
          paddingRight: 4,
          background: renderStatusBackground(categoryCode),
          color: 'white',
          maxWidth: 50,
          minWidth: 20,
          textAlign: 'center',
          height: 20,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {statusName}
      </p>
    </Tooltip>
  );
}

/**
 * 任务经办人呈现
 * @returns React 函数式组件
 * @param assigneeName
 * @param assigneeId
 * @param imageUrl
 */
export function Assignee({ assigneeName, assigneeId, imageUrl }) {
  return (
    <Tooltip title={assigneeName ? `经办人: ${assigneeName}` : ''}>
      {
        assigneeName ? (
          <UserHead
            hiddenText
            size={32}
            style={{ marginLeft: 8 }}
            user={{
              id: assigneeId,
              loginName: assigneeName,
              realName: assigneeName,
              avatar: imageUrl,
            }}
          />
        ) : (
          <div style={{
            width: 32,
            height: 32,
            flexShrink: 0,
            marginLeft: 8,
            marginBottom: 4,
          }}
          />
        )
      }
    </Tooltip>
  );
}

/**
 * 任务经办人呈现
 * @returns React 函数式组件
 * @param summary
 */
export function Summary({ summary }) {
  return (
    <Tooltip title={summary} placement="topLeft">
      <p className="textDisplayTwoColumn">
        {summary}
      </p>
    </Tooltip>
  );
}
