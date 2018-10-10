import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Page, Header, Content, stores, axios, Permission, 
} from 'choerodon-front-boot';
import _ from 'lodash';
import {
  Button, Spin, Modal, Form, Input, Select, Tabs, message, Icon, 
} from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import './ScrumBoardSetting.scss';
import ScrumBoardStore from '../../../../stores/project/scrumBoard/ScrumBoardStore';
import ColumnPage from '../ScrumBoardSettingComponent/ColumnPage/ColumnPage';
import SwimLanePage from '../ScrumBoardSettingComponent/SwimLanePage/SwimLanePage';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const { AppState } = stores;

@observer
class ScrumBoardSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    this.refresh();
  }

  // getQueryVariable(variable) {
  //   const data = window.location.hash.split('?')[1].split('&');
  //   const result = _.find(data, o => o.indexOf(variable) !== -1).replace(/[^0-9]/ig, '');
  //   return parseInt(result, 10);
  // }
  // setLoading = () => {
  //   this.setState({
  //     loading: true,
  //   });
  // }

  refresh() {
    this.setState({
      loading: true,
    });
    const boardId = ScrumBoardStore.getSelectedBoard;
    if (!boardId) {
      const { history } = this.props;
      const urlParams = AppState.currentMenuType;
      history.push(`/agile/scrumboard?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    } else {
      ScrumBoardStore.axiosGetBoardDataBySetting(boardId).then((data) => {
        ScrumBoardStore.axiosGetUnsetData(boardId).then((data2) => {
          const unsetColumn = {
            columnId: 'unset',
            name: '未对应的状态',
            subStatuses: data2,
          };
          data.columnsData.columns.push(unsetColumn);
          ScrumBoardStore.setBoardData(data.columnsData.columns);
          this.setState({
            loading: false,
          });
        }).catch((error2) => {
        });
      }).catch((error) => {
      });
      ScrumBoardStore.axiosGetLookupValue('constraint').then((res) => {
        const oldLookup = ScrumBoardStore.getLookupValue;
        oldLookup.constraint = res.lookupValues;
        ScrumBoardStore.setLookupValue(oldLookup);
      }).catch((error) => {
      });
    }
  }
  
  handleDeleteBoard() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    let name;
    for (let index = 0, len = ScrumBoardStore.getBoardList.length; index < len; index += 1) {
      if (ScrumBoardStore.getBoardList[index].boardId === ScrumBoardStore.getSelectedBoard) {
        name = ScrumBoardStore.getBoardList[index].name;
      }
    }
    confirm({
      title: `删除看板"${name}"`,
      content: '确定要删除该看板吗?',
      okText: '删除',
      cancelText: '取消',
      className: 'scrumBoardMask',
      width: 520,
      onOk() {
        ScrumBoardStore.axiosDeleteBoard().then((res) => {
          history.push(`/agile/scrumboard?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
        }).catch((error) => {
        });
      },
      onCancel() {
      },
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const urlParams = AppState.currentMenuType;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <Page>
        <Header title="配置看板" backPath={`/agile/scrumboard?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}`}>
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.board.deleteScrumBoard']}>
            <Button funcType="flat" onClick={this.handleDeleteBoard.bind(this)} disabled={ScrumBoardStore.getBoardList.length === 1}>
              <Icon type="delete_forever icon" />
              <span>删除看板</span>
            </Button>
          </Permission>
          <Button funcType="flat" onClick={this.refresh.bind(this)}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content className="c7n-scrumboard" style={{ height: '100%', paddingTop: 0 }}>
          <Tabs style={{ display: 'flex', flexDirection: 'column', height: '100%' }} defaultActiveKey="1">
            <TabPane tab="列配置" key="1">
              <Spin spinning={this.state.loading}>
                <ColumnPage
                  // setLoading={this.setLoading}
                  refresh={this.refresh.bind(this)}
                />
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

export default Form.create()(withRouter(ScrumBoardSetting));
