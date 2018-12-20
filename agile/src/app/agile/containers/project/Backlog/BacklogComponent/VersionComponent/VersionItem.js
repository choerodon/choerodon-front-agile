import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import moment from 'moment';
import { stores, Permission } from 'choerodon-front-boot';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import {
  message, DatePicker, Icon, Dropdown, Menu, Input,
} from 'choerodon-ui';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import EasyEdit from '../../../../../components/EasyEdit/EasyEdit';

const { AppState } = stores;

@observer
class VersionItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // editDescription: false,
      editName: false,
      // editStartDate: false,
      // editEndDate: false,
      // hoverBlockEditName: false,
      // hoverBlockEditDes: false,
    };
  }

  /**
   *下拉菜单的menu
   *
   * @returns
   * @memberof VersionItem
   */
  getmenu() {
    return (
      <Menu onClick={this.clickMenu.bind(this)}>
        <Menu.Item key="0">编辑名称</Menu.Item>
      </Menu>
    );
  }

  /**
   *点击单个menu的事件
   *
   * @param {*} e
   * @memberof VersionItem
   */
  clickMenu(e) {
    e.domEvent.stopPropagation();
    if (e.key === '0') {
      this.setState({
        editName: true,
      });
    }
  }

  /**
   *好像这个方法没用了

   *
   * @param {*} e
   * @memberof VersionItem
   */
  handleClickName(e) {
    e.stopPropagation();
    this.setState({
      editName: true,
    });
  }

  /**
   *
   *这个方法好像也没用了
   * @param {*} e
   * @memberof VersionItem
   */
  handleClickDes(e) {
    e.stopPropagation();
    // this.setState({
    //   editDescription: true,
    // });
  }

  /**
   *更新描述
   *
   * @param {*} value
   * @memberof VersionItem
   */
  handleOnBlurDes(value) {
    const { data: { objectVersionNumber, versionId }, index } = this.props;
    const data = {
      objectVersionNumber,
      projectId: parseInt(AppState.currentMenuType.id, 10),
      versionId,
      description: value,
    };
    BacklogStore.axiosUpdateVerison(versionId, data).then((res) => {
      // this.setState({
      //   editDescription: false,
      // });
      const originData = _.clone(BacklogStore.getVersionData);
      originData[index].description = res.description;
      originData[index].objectVersionNumber = res.objectVersionNumber;
      BacklogStore.setVersionData(originData);
    }).catch((error) => {
      // this.setState({
      //   editDescription: false,
      // });
    });
  }

  /**
   *更改名称
   *
   * @param {*} value
   * @memberof VersionItem
   */
  handleBlurName(e) {
    const { data: { objectVersionNumber, versionId }, index } = this.props;
    const data = {
      objectVersionNumber,
      projectId: parseInt(AppState.currentMenuType.id, 10),
      versionId,
      name: e.target.value,
    };
    BacklogStore.axiosUpdateVerison(versionId, data).then((res) => {
      if (res && res.failed) {
        this.setState({
          editName: false,
        });
        message.error(res.message);
      } else {
        this.setState({
          editName: false,
        });
        const originData = _.clone(BacklogStore.getVersionData);
        originData[index].name = res.name;
        originData[index].objectVersionNumber = res.objectVersionNumber;
        BacklogStore.setVersionData(originData);
      }
    }).catch((error) => {
      this.setState({
        editName: false,
      });
    });
  }

  /**
   *更新日期
   *
   * @param {*} type
   * @param {*} date2
   * @memberof VersionItem
   */
  updateDate(type, date2) {
    let date = date2;
    const { data: { objectVersionNumber, versionId }, index } = this.props;
    const data = {
      objectVersionNumber,
      projectId: parseInt(AppState.currentMenuType.id, 10),
      versionId,
      [type]: date ? date += ' 00:00:00' : null,
    };
    BacklogStore.axiosUpdateVerison(versionId, data).then((res) => {
      const originData = _.clone(BacklogStore.getVersionData);
      originData[index][type] = res[type];
      originData[index].objectVersionNumber = res.objectVersionNumber;
      BacklogStore.setVersionData(originData);
    }).catch((error) => {
    });
  }

  render() {
    // const { data: item } = this.props;
    const {
      data: item, index, handelClickVersion, issueRefresh, refresh, draggableIds,
    } = this.props;
    const { editName } = this.state;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <Draggable draggableId={`versionItem-${index}`} key={`versionItem-${index}`} index={index}>
        {(provided1, snapshot1) => (
          <div
            ref={provided1.innerRef}
            {...provided1.draggableProps}
            {...provided1.dragHandleProps}
            className={BacklogStore.getIsDragging ? 'c7n-backlog-versionItems c7n-backlog-dragToVersion' : 'c7n-backlog-versionItems'}
            style={{
              background: BacklogStore.getChosenVersion === item.versionId ? 'rgba(140, 158, 255, 0.08)' : 'white',
              paddingLeft: 0,
              cursor: 'move',
              ...provided1.draggableProps.style,
            }}
            role="none"
            onClick={handelClickVersion.bind(this, item.versionId)}
            onMouseEnter={() => {
              // this.setState({
              //   hoverBlockEditName: true,
              // });
            }}
            onMouseLeave={() => {
              // this.setState({
              //   hoverBlockEditName: false,
              // });
            }}
            onMouseUp={() => {
              if (BacklogStore.getIsDragging) {
                BacklogStore.axiosUpdateIssuesToVersion(
                  item.versionId, draggableIds,
                ).then((res) => {
                  issueRefresh();
                  refresh();
                }).catch((error) => {
                  issueRefresh();
                  refresh();
                });
              }
            }}
          >

            <div className="c7n-backlog-versionItemTitle">
              <Icon
                type={item.expand ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}
                role="none"
                onClick={(e) => {
                  const data = BacklogStore.getVersionData;
                  e.stopPropagation();
                  data[index].expand = !data[index].expand;
                  BacklogStore.setVersionData(data);
                }}
              />
              <div style={{ width: '100%' }}>
                <div 
                  className="c7n-backlog-ItemsHead"
                >
                  {editName ? (
                    <Input
                      className="editVersionName"
                      autoFocus
                      defaultValue={item.name}
                      onPressEnter={this.handleBlurName.bind(this)}
                        // onBlur={this.handleBlurName.bind(this)}
                      onClick={e => e.stopPropagation()}
                      maxLength={10}
                    />
                    
                  ) : (
                    <p>{item.name}</p>
                  )}
                      
                  <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.product-version.createVersion']}>
                    <Dropdown onClick={e => e.stopPropagation()} overlay={this.getmenu()} trigger={['click']}>
                      <Icon
                          style={{
                            width: 12,
                            height: 12,
                            background: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '1px solid #ccc',
                            borderRadius: 2,
                          }}
                          type="arrow_drop_down"
                        />
                    </Dropdown>
                  </Permission>
                </div>
                {/* </div> */}
                <div className="c7n-backlog-versionItemProgress">
                  <div
                    className="c7n-backlog-versionItemDone"
                    style={{
                    flex: item.doneIssueCount,
                  }}
                  />
                  <div
                    className="c7n-backlog-versionItemTodo"
                    style={{
                    flex: item.issueCount ? item.issueCount - item.doneIssueCount : 1,
                  }}
                  />
                </div>
              </div>
            </div>
           
            {item.expand ? (
              <div style={{ paddingLeft: 12 }}>
                <div
                  style={{ marginTop: 12 }}
                  onMouseEnter={() => {
                    // this.setState({
                    //   hoverBlockEditDes: true,
                    // });
                  }}
                  onMouseLeave={() => {
                    // this.setState({
                    //   hoverBlockEditDes: false,
                    // });
                  }}
                >
                  <Permission
                    type={type}
                    projectId={projectId}
                    organizationId={orgId}
                    service={['agile-service.product-version.updateVersion']}
                    noAccessChildren={(
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p className="c7n-backlog-versionItemDes c7n-backlog-versionItemNotStoryPoint" ref={(versionId) => { this[item.versionId] = versionId; }}>
                          {!item.description ? '没有描述' : item.description}
                        </p>
                      </div>
)}
                  >
                    <EasyEdit
                      type="input"
                      defaultValue={item.description}
                      enterOrBlur={this.handleOnBlurDes.bind(this)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p className="c7n-backlog-versionItemDes" ref={(versionId) => { this[item.versionId] = versionId; }}>
                          {!item.description ? '没有描述' : item.description}
                        </p>
                      </div>
                    </EasyEdit>
                  </Permission>
                </div>
                <p className="c7n-backlog-versionItemDetail">详情</p>
                <div className="c7n-backlog-versionItemParams">
                  <div className="c7n-backlog-versionItemParam">
                    <p style={{ color: 'rgba(0,0,0,0.65)' }}>开始日期</p>
                    <Permission
                      type={type}
                      projectId={projectId}
                      organizationId={orgId}
                      service={['agile-service.product-version.updateVersion']}
                      noAccessChildren={<p className="c7n-backlog-versionItemNotStoryPoint">{!_.isNull(item.startDate) ? `${item && item.startDate.split('-')[0]}/${item.startDate.split('-')[1]}/${item.startDate.split('-')[2].substring(0, 2)}` : '无'}</p>}
                    >
                      <EasyEdit
                        type="date"
                        defaultValue={item.startDate ? moment(item.startDate.split(' ')[0], 'YYYY-MM-DD') : ''}
                        disabledDate={item.expectReleaseDate ? current => current > moment(item.expectReleaseDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                        onChange={(date, dateString) => {
                          this.updateDate('startDate', dateString);
                        }}
                      >
                        <p className="c7n-backlog-versionItemNotStoryPoint">{!_.isNull(item.startDate) ? `${item && item.startDate.split('-')[0]}/${item.startDate.split('-')[1]}/${item.startDate.split('-')[2].substring(0, 2)}` : '无'}</p>
                      </EasyEdit>
                    </Permission>
                  </div>
                  <div className="c7n-backlog-versionItemParam">
                    <p style={{ color: 'rgba(0,0,0,0.65)' }}>预计发布日期</p>
                    <Permission
                      type={type}
                      projectId={projectId}
                      organizationId={orgId}
                      service={['agile-service.product-version.updateVersion']}
                      noAccessChildren={<p className="c7n-backlog-versionItemNotStoryPoint">{!_.isNull(item.expectReleaseDate) ? `${item && item.expectReleaseDate.split('-')[0]}/${item.expectReleaseDate.split('-')[1]}/${item.expectReleaseDate.split('-')[2].substring(0, 2)}` : '无'}</p>}
                    >
                      <EasyEdit
                        type="date"
                        defaultValue={item.expectReleaseDate ? moment(item.expectReleaseDate.split(' ')[0], 'YYYY-MM-DD') : ''}
                        disabledDate={item.startDate ? current => current < moment(item.startDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                        onChange={(date, dateString) => {
                          this.updateDate('expectReleaseDate', dateString);
                        }}
                      >
                        <p className="c7n-backlog-versionItemNotStoryPoint">{!_.isNull(item.expectReleaseDate) ? `${item && item.expectReleaseDate.split('-')[0]}/${item.expectReleaseDate.split('-')[1]}/${item.expectReleaseDate.split('-')[2].substring(0, 2)}` : '无'}</p>
                      </EasyEdit>
                    </Permission>
                  </div>
                  <div className="c7n-backlog-versionItemParam">
                    <p className="c7n-backlog-versionItemParamKey">问题数</p>
                    <p className="c7n-backlog-versionItemNotStoryPoint">{item.issueCount}</p>
                  </div>
                  <div className="c7n-backlog-versionItemParam">
                    <p className="c7n-backlog-versionItemParamKey">已完成数</p>
                    <p className="c7n-backlog-versionItemNotStoryPoint">{item.doneIssueCount}</p>
                  </div>
                  <div className="c7n-backlog-versionItemParam">
                    <p className="c7n-backlog-versionItemParamKey">未预估数</p>
                    <p className="c7n-backlog-versionItemNotStoryPoint">{item.notEstimate}</p>
                  </div>
                  <div className="c7n-backlog-versionItemParam">
                    <p className="c7n-backlog-versionItemParamKey">故事点数</p>
                    <p className="c7n-backlog-versionItemParamValue" style={{ minWidth: 31 }}>{`${item.totalEstimate}`}</p>
                  </div>
                </div>
              </div>
            ) : ''}
          </div>
        )}
      </Draggable>
    );
  }
}

export default VersionItem;
