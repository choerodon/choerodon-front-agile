import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Droppable } from 'react-beautiful-dnd';
import {
  Input, Button, Select, Icon, Tooltip, Modal, Avatar, Dropdown, Menu,
} from 'choerodon-ui';
import './Sprint.scss';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import SprintContainer from './SprintItemComponent/SprintContainer';
import NoneSprint from './SprintItemComponent/NoneSprint';

const { confirm } = Modal;

@observer
class SprintItem extends Component {
  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  /**
   *删除冲刺事件
   *
   * @param {*} e
   * @memberof SprintItem
   */
  handleDeleteSprint = (item, e) => {
    const that = this;
    const { store, refresh } = this.props;
    if (e.key === '0') {
      if (item.issueSearchDTOList && item.issueSearchDTOList.length > 0) {
        confirm({
          width: 560,
          wrapClassName: 'deleteConfirm',
          title: `删除冲刺${item.sprintName}`,
          content: (
            <div>
              <p style={{ marginBottom: 10 }}>请确认您要删除这个冲刺。</p>
              <p style={{ marginBottom: 10 }}>这个冲刺将会被彻底删除，冲刺中的任务将会被移动到待办事项中。</p>
            </div>
          ),
          onOk() {
            return that.props.store.axiosDeleteSprint(item.sprintId).then((res) => {
              that.props.refresh();
            }).catch((error) => {
            });
          },
          onCancel() {},
          okText: '删除',
          okType: 'danger',
        });
      } else {
        store.axiosDeleteSprint(item.sprintId).then((res) => {
          refresh();
        }).catch((error) => {
        });
      }
    }
  };

  render() {
    const { refresh } = this.props;
    return (
      <div
        role="none"
        onClick={() => {
          BacklogStore.onBlurClick();
        }}
      >
        {
          BacklogStore.getSprintData.length
            ? BacklogStore.getSprintData.map(sprintItem => (
              <SprintContainer
                refresh={refresh}
                key={sprintItem.sprintId}
                data={sprintItem}
                type="sprint"
              />
            )) : <NoneSprint />
        }
        <SprintContainer
          key="0"
          data={BacklogStore.getBacklogData}
          type="backlog"
        />
      </div>
    );
  }
}

export default SprintItem;
