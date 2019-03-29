import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Icon, Dropdown, Menu } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import classnames from 'classnames';
import ClosePI from '../../ClosePI';

const { AppState } = stores;

@observer class SprintStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startSprintVisible: false,
      finishSprintVisible: false,
    };
  }

  menu = handleDeleteSprint => (
    <Menu
      onClick={handleDeleteSprint}
    >
      <Menu.Item key="0">
        {'删除sprint'}
      </Menu.Item>
    </Menu>
  );

  handleFinish = (e) => {
    const { store, piId } = this.props;
    e.stopPropagation();
    store.axiosGetSprintCompleteMessage(piId).then((res) => {
      store.setSprintCompleteMessage(res);
    }).catch((error) => {
    });
    this.setState({
      finishSprintVisible: true,
    });
  };

  handleOpen = (e) => {
    const { store, data } = this.props;
    e.stopPropagation();
    if (!store.getHasActiveSprint && data.subFeatureDTOList && data.subFeatureDTOList.length > 0) {
      const pi = {
        programId: AppState.currentMenuType.id,
        id: data.id,
        objectVersionNumber: data.objectVersionNumber,
      };
      store.openPI(pi).then((res) => {
        if (res && !res.failed) {
          Choerodon.prompt('PI开启成功！');
        }
      }).catch((error) => {
      });
    }
  };

  render() {
    const {
      handleDeleteSprint, statusCode, data, store, refresh, type,
    } = this.props;
    const { finishSprintVisible, startSprintVisible } = this.state;
    // TODO: 内部接口逻辑
    return (
      <div className="c7n-backlog-sprintTitleSide">
        {statusCode === 'doing' ? (
          <React.Fragment>
            <p className="c7n-backlog-sprintStatus">
              {'活跃'}
            </p>
            <div style={{ display: 'flex' }}>
              <p
                className="c7n-backlog-closeSprint"
                role="none"
                onClick={this.handleFinish}
              >
                {type === 'sprint' ? '完成冲刺' : '完成PI'}
              </p>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p className="c7n-backlog-sprintStatus2">
              {'未开始'}
            </p>
            <div style={{ display: 'flex' }}>
              <p
                className={classnames('c7n-backlog-closeSprint', {
                  'c7n-backlog-canCloseSprint': store.getHasActiveSprint || !data.subFeatureDTOList || data.subFeatureDTOList.length === 0,
                })}
                role="none"
                onClick={this.handleOpen}
              >
                {type === 'sprint' ? '开启冲刺' : '开启PI'}
              </p>
              {type === 'sprint'
                ? (
                  <Dropdown overlay={this.menu(handleDeleteSprint)} trigger={['click']}>
                    <Icon style={{ cursor: 'pointer', marginLeft: 5 }} type="more_vert" />
                  </Dropdown>
                ) : ''
              }
            </div>
          </React.Fragment>
        )}
        <ClosePI
          store={store}
          visible={finishSprintVisible}
          onCancel={() => {
            this.setState({
              finishSprintVisible: false,
            });
          }}
          data={data}
          refresh={refresh}
        />
      </div>
    );
  }
}

export default SprintStatus;
