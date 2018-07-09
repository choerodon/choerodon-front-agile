import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { stores, Page, Header, Content, Permission, axios } from 'choerodon-front-boot';
import { Button, Icon, Tabs } from 'choerodon-ui';
import ProjectSetting from '../SettingComponent/ProjectSetting';
import Search from '../SettingComponent/Search';
import Link from '../SettingComponent/Link';

const FileSaver = require('file-saver');

const { AppState } = stores;
const TabPane = Tabs.TabPane;

@observer
class SettingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: undefined,
    };
  }

  handleClick() {
    const projectId = AppState.currentMenuType.id;
    // axios({
    //   method: 'post',
    //   url: 'http://gateway.hitsm.cloud.saas.hand-china.com/hitsm/v1/project/275/eventOrder/exportEventOrders?organizationId=302',
    //   headers: {
    //     Authorization: 'bearer c7144b0b-1f34-40cc-90d1-ac63dec15efd',
    //   },
    //   data: {
    //     state: '',
    //   },
    //   responseType: 'arraybuffer', 
    //   timeout: 60000,
    // })
    axios.post(`/agile/v1/projects/${projectId}/issues/export`)
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = 'test.xls';
        FileSaver.saveAs(blob, fileName);
        // const blob = new Blob(['\uFEFF' + res], { type: 'application/ms-excel;charset=utf-8' });
        // const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
        // const href = window.URL.createObjectURL(blob);
        // this.setState({
        //   url: href,
        // });
      });
  }

  render() {
    return (
      <Page>
        <Header title="测试">
          <Button funcTyp="flat">
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title="张建测试"
          description="给张建的测试"
          // link="#"
        >
          <Button funcTyp="flat" onClick={() => this.handleClick()}>
            <Icon type="refresh" />获取
          </Button>
          <a href={this.state.url}>url</a>
        </Content>
      </Page>
    );
  }
}

export default SettingHome;

