import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Tabs, Table, Select, Icon, Tooltip, Dropdown, Menu } from 'choerodon-ui';
import './VelocityChart.scss';

const { AppState } = stores;

@observer
class VelocityChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  render() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    return (
      <Page className="c7n-report">
        <Header 
          title="冲刺报告"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <Button 
            funcType="flat" 
            onClick={() => { window.console.log('onClick'); }}
          >
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="添加速度图"
          description="了解每个冲刺中完成、进行和退回待办的工作。这有助于您确定您团队的工作量是否超额，更直观的查看冲刺的范围与工作量。"
          link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/report/sprint/"
        />
      </Page>
    );
  }
}

export default VelocityChart;
