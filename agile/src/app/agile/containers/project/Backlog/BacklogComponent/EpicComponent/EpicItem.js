import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Dropdown, Menu, Input, Icon } from 'choerodon-ui';
import _ from 'lodash';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@inject('AppState')
@observer
class EpicItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editName: false,
    };
  }
  getmenu() {
    return (
      <Menu onClick={this.clickMenu.bind(this)}>
        <div style={{ padding: '5px 12px' }}>
          颜色
          <div className="c7n-backlog-epicColor">
            {BacklogStore.getColorLookupValue.map(item => (
              <div
                style={{ background: item.name }}
                className="c7n-backlog-epicColorItem"
                role="none"
                onClick={(e) => {
                  e.stopPropagation();
                  const data = {
                    colorCode: item.valueCode,
                    issueId: this.props.data.issueId,
                    objectVersionNumber: this.props.data.objectVersionNumber,
                  };
                  BacklogStore.axiosUpdateIssue(data).then((res) => {
                    this.props.refresh();
                  }).catch((error) => {
                    window.console.error(error);
                  });
                }}
              />
            ))}
          </div>
        </div>
        <Menu.Divider />
        <Menu.Item key="1">编辑名称</Menu.Item>
        <Menu.Item key="2">查看史诗详情</Menu.Item>
      </Menu>
    );
  }
  clickMenu(e) {
    e.domEvent.stopPropagation();
    if (e.key === '1') {
      this.setState({
        editName: true,
      });
    }
    if (e.key === '2') {
      BacklogStore.setClickIssueDetail(this.props.data);
    }
  }
  handleSave(e) {
    e.stopPropagation();
    this.setState({
      editName: false,
    });
    const dataP = {
      objectVersionNumber: this.props.data.objectVersionNumber,
      issueId: this.props.data.issueId,
      epicName: e.target.value,
    };
    BacklogStore.axiosUpdateIssue(dataP).then((res) => {
      const originEpic = _.clone(BacklogStore.getEpicData);
      originEpic[this.props.index].epicName = res.epicName;
      originEpic[this.props.index].objectVersionNumber = res.objectVersionNumber;
      BacklogStore.setEpicData(originEpic);
    }).catch((error) => {
      window.console.error(error);
    });
  }
  render() {
    const item = this.props.data;
    const data = BacklogStore.getEpicData;
    const index = this.props.index;
    return (
      <div
        className={BacklogStore.getIsDragging ? 'c7n-backlog-epicItems c7n-backlog-dragToEpic' : 'c7n-backlog-epicItems'}
        style={{
          background: BacklogStore.getChosenEpic === item.issueId ? 'rgba(140, 158, 255, 0.08)' : '',
          paddingLeft: 0,
        }}
        role="none"
        onClick={this.props.handleClickEpic.bind(this, item.issueId)}
        onMouseUp={() => {
          if (BacklogStore.getIsDragging) {
            BacklogStore.axiosUpdateIssuesToEpic(
              item.issueId, this.props.draggableIds).then((res) => {
              this.props.issueRefresh();
              this.props.refresh();
            }).catch((error) => {
              window.console.error(error);
              this.props.issueRefresh();
              this.props.refresh();
            });
          }
        }}
      >
        <div className="c7n-backlog-epicItemTitle">
          <Icon
            type={item.expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
            role="none"
            onClick={(e) => {
              e.stopPropagation();
              data[index].expand = !data[index].expand;
              BacklogStore.setEpicData(data);
            }}
          />
          <div style={{ width: '100%' }}>
            <div className="c7n-backlog-epicItemsHead">
              {this.state.editName ? (
                <Input
                  autoFocus
                  defaultValue={item.epicName}
                  onPressEnter={this.handleSave.bind(this)}
                  onClick={e => e.stopPropagation()}
                  onBlur={this.handleSave.bind(this)}
                  maxLength={44}
                />
              ) : (
                <p>{item.epicName}</p>
              )}
              <Dropdown onClick={e => e.stopPropagation()} overlay={this.getmenu()} trigger={['click']}>
                <Icon
                  style={{
                    width: 12,
                    height: 12,
                    background: item.color,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                  }}
                  type="arrow_drop_down"
                />
              </Dropdown>
            </div>
            <div className="c7n-backlog-epicItemProgress">
              <div
                className="c7n-backlog-epicItemDone"
                style={{
                  flex: item.doneIssueCount,
                }}
              />
              <div 
                className="c7n-backlog-epicItemTodo"
                style={{ 
                  flex: item.issueCount ? item.issueCount - item.doneIssueCount : 1,
                }}
              />
            </div>
          </div>
        </div>
        {item.expand ? (
          <div style={{ paddingLeft: 12 }}>
            <p className="c7n-backlog-epicItemDes">
              {_.isNull(item.summary) ? '没有描述' : item.summary}
            </p>
            <p className="c7n-backlog-epicItemDetail">详情</p>
            <div className="c7n-backlog-epicItemParams">
              <div className="c7n-backlog-epicItemParam">
                <p className="c7n-backlog-epicItemParamKey">问题</p>
                <p className="c7n-backlog-epicItemParamValue">{item.issueCount}</p>
              </div>
              <div className="c7n-backlog-epicItemParam">
                <p className="c7n-backlog-epicItemParamKey">已完成</p>
                <p className="c7n-backlog-epicItemParamValue">{item.doneIssueCount}</p>
              </div>
              <div className="c7n-backlog-epicItemParam">
                <p className="c7n-backlog-epicItemParamKey">未预估</p>
                <p className="c7n-backlog-epicItemParamValue">{item.notEstimate}</p>
              </div>
              <div className="c7n-backlog-epicItemParam">
                <p className="c7n-backlog-epicItemParamKey">预估</p>
                <p className="c7n-backlog-epicItemParamValue">{item.totalEstimate}p</p>
              </div>
            </div>
          </div>
        ) : ''}
      </div>
    );
  }
}

export default EpicItem;

