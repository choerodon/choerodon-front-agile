import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  Page, Header, Content,
} from 'choerodon-front-boot';
import {
  Button, Spin, Tabs, Icon,
} from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { ProgramBoardLink } from '../../../../common/utils';
import BoardStore from '../../../../stores/Program/Board/BoardStore';
import { SwimLanePage } from './components';

const { TabPane } = Tabs;


@observer
@withRouter
class BoardSetting extends Component {
  state = {
    loading: false,
    hasPermission: false,
  };

  componentDidMount() {
    this.refresh();
    // axios.post('/iam/v1/permissions/checkPermission', [{
    //   code: 'agile-service.project-info.updateProjectInfo',
    //   organizationId: AppState.currentMenuType.organizationId,
    //   projectId: AppState.currentMenuType.id,
    //   resourceType: 'project',
    // }]).then((permission) => {
    //   this.setState({
    //     hasPermission: !permission[0].approve,
    //   });
    // });
  }

  refresh() {
    this.setState({
      loading: true,
    });
    const boardId = BoardStore.getSelectedBoard;
    if (!boardId) {
      const { history } = this.props;
      history.push(ProgramBoardLink());
    } else {
      BoardStore.loadStatus();
      BoardStore.axiosGetBoardDataBySetting(boardId).then((data) => {
        BoardStore.axiosGetUnsetData(boardId).then((data2) => {
          const unsetColumn = {
            columnId: 'unset',
            name: '未对应的状态',
            subStatuses: data2,
          };
          data.columnsData.push(unsetColumn);
          BoardStore.setBoardData(data.columnsData);
          this.setState({
            loading: false,
          });
        }).catch((error2) => {
        });
      }).catch((error) => {
      });
      BoardStore.axiosGetLookupValue('constraint').then((res) => {
        const oldLookup = BoardStore.getLookupValue;
        oldLookup.constraint = res.lookupValues;
        BoardStore.setLookupValue(oldLookup);
      }).catch((error) => {
      });
      BoardStore.axiosCanAddStatus();
    }
  }

  render() {
    const { loading } = this.state;
    return (
      <Page>
        <Header title="配置看板" backPath={ProgramBoardLink()}>          
          {/* <Button funcType="flat" onClick={this.refresh}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button> */}
        </Header>
        <Content className="c7n-scrumboard" style={{ height: '100%', paddingTop: 0 }}>
          <Tabs
            style={{
              display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto',
            }}
            defaultActiveKey="1"
          >
            <TabPane tab="列配置" key="1">
              <Spin spinning={loading}>
                {/* <ColumnPage
                  refresh={this.refresh.bind(this)}
                /> */}
              </Spin>
            </TabPane>
            <TabPane tab="泳道" key="2">
              <SwimLanePage />
            </TabPane>           
          </Tabs>
        </Content>
      </Page>
    );
  }
}

BoardSetting.propTypes = {

};

export default BoardSetting;
