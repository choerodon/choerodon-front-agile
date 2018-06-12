import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Spin, Modal, Form, Input, Select, Tabs, message, Icon } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import './ScrumBoardSetting.scss';
import '../../../main.scss';
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

    };
  }
  componentWillMount() {
    this.refresh();
  }
  refresh() {
    ScrumBoardStore.axiosGetBoardData(ScrumBoardStore.getSelectedBoard).then((data) => {
      ScrumBoardStore.axiosGetUnsetData(ScrumBoardStore.getSelectedBoard).then((data2) => {
        const unsetColumn = {
          columnId: 'unset',
          name: '未对应的状态',
          subStatuses: data2,
        };
        data.columnsData.columns.push(unsetColumn);
        ScrumBoardStore.setBoardData(data.columnsData.columns);
      }).catch((error2) => {
        window.console.log(error2);
      });
    }).catch((error) => {
      window.console.log(error);
    });
    ScrumBoardStore.axiosGetLookupValue('constraint').then((res) => {
      const oldLookup = ScrumBoardStore.getLookupValue;
      oldLookup.constraint = res.lookupValues;
      ScrumBoardStore.setLookupValue(oldLookup);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  
  handleDeleteBoard() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    let name;
    _.forEach(ScrumBoardStore.getBoardList, (item) => {
      if (item.boardId === ScrumBoardStore.getSelectedBoard) {
        name = item.name;
      }
    });
    confirm({
      title: `删除看板${name}`,
      content: '确定要删除该看板吗?',
      okText: '删除',
      cancelText: '取消',
      onOk() {
        ScrumBoardStore.axiosDeleteBoard().then((res) => {
          history.push(`/agile/scrumboard?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
        }).catch((error) => {
          window.console.log(error);
        });
      },
      onCancel() {
        window.console.log('Cancel');
      },
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const urlParams = AppState.currentMenuType;
    return (
      <Page>
        <Header title="配置看板" backPath={`/agile/scrumboard?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>
          <Button funcTyp="flat" onClick={this.handleDeleteBoard.bind(this)} disabled={ScrumBoardStore.getBoardList.length === 1}>
            <Icon type="delete_forever icon" />
            <span>删除看板</span>
          </Button>
          <Button funcTyp="flat" onClick={this.refresh.bind(this)}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content style={{ height: '100%', paddingTop: 0 }}>
          <Tabs style={{ display: 'flex', flexDirection: 'column' }} defaultActiveKey="1">
            <TabPane tab="列配置" key="1">
              <ColumnPage
                refresh={this.refresh.bind(this)}
              />
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

