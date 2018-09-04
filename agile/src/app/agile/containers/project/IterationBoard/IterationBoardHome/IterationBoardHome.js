import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, stores, Content } from 'choerodon-front-boot';
import { Row, Col } from 'choerodon-ui';
import _ from 'lodash';
import Assignee from '../IterationBoardComponent/Assignee';
import BurnDown from '../IterationBoardComponent/BurnDown';
import Sprint from '../IterationBoardComponent/Sprint';
import Status from '../IterationBoardComponent/Status';
import Remain from '../IterationBoardComponent/Remain';
import Priority from '../IterationBoardComponent/Priority';

import './IterationBoardHome.scss';

const { AppState } = stores;

@observer
class IterationBoardHome extends Component {
  render() {
    return (
      <Page>
        <Header title="迭代工作台" />
        <Content>
          <Row gutter={20}>
            <Col span={8}>
              <Sprint />
            </Col>
            <Col span={8}>
              <Status />
            </Col>
            <Col span={8}>
              <Remain />
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={24}>
              <BurnDown />
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={8}>
              <Priority />
            </Col>
            <Col span={8}>
              <Assignee />
            </Col>
          </Row>
        </Content>
      </Page>
    );
  }
}
export default IterationBoardHome;
