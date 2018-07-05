import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { stores, axios, Page, Header, Content, Permission } from 'choerodon-front-boot';
import { Button, Icon, Tabs } from 'choerodon-ui';
import ProjectSetting from '../SettingComponent/ProjectSetting';
import Search from '../SettingComponent/Search';
import Link from '../SettingComponent/Link';

const { AppState } = stores;
const TabPane = Tabs.TabPane;

@observer
class SettingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleClick() {
    const projectId = AppState.currentMenuType.id;
    axios.get(`agile/v1/projects/${projectId}/issues/export`);
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
        </Content>
      </Page>
    );
  }
}

export default SettingHome;

