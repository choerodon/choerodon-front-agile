import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Spin, message, Icon } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@observer
class BurndownChartHome extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Page>
        <Header title="燃尽图">
          <Button funcTyp="flat">
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title="迭代冲刺“xxxx”的燃尽图"
          description="了解每个sprint中完成的工作或者退回后备的工作。这有助于您确定您的团队是过量使用或如果有过多的范围扩大。"
          link="#"
        >
            123
        </Content>
      </Page>
    );
  }
}

export default BurndownChartHome;

