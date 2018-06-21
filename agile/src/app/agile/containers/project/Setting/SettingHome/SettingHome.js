import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Icon, Tabs } from 'choerodon-ui';

const { AppState } = stores;
const TabPane = Tabs.TabPane;

@observer
class SettingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  render() {
    return (
      <Page>
        <Header title="设置">
          <Button funcTyp="flat">
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title="设置"
          description="根据项目需求，可以分拆为多个模块，每个模块可以进行负责人划分。配置后可以将项目中的问题归类到对应的模块中。例如“后端任务”，“基础框架”等等。"
          link="#"
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="项目设置" key="1" />
            <TabPane tab="快速搜索" key="2" />
            <TabPane tab="状态" key="3" />
            <TabPane tab="问题链接" key="4" />
          </Tabs>
        </Content>
      </Page>
    );
  }
}

export default SettingHome;

