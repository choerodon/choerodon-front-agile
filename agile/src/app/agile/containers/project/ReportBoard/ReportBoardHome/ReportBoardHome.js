import React, { Component } from 'react';
import { Row, Col } from 'choerodon-ui';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import VersionProgress from '../ReportBoardComponent/VersionProgress';
import IssueType from '../ReportBoardComponent/IssueType';
import IterationType from '../ReportBoardComponent/IterationType';
import './ReportBoardHome.scss';

class ReportBoardHome extends Component {
  render() {
    return (
      <Page className="c7n-agile-reportBoard">
        <Header title="报告工作台" />
        <Content>
          <div className="c7n-reportBoard">
            <Row>
              <Col span={24} />
            </Row>
            <Row gutter={20}>
              <Col span={12} />
              <Col span={12}><VersionProgress /></Col>
            </Row>
            <Row gutter={20}>
              <Col span={10} />
              <Col span={14}><IssueType /></Col>
            </Row>
            <Row gutter={20}>
              <Col span={8} />
              <Col span={8} />
              <Col span={8}><IterationType /></Col>
            </Row>
            <Row>
              <Col span={24} />
            </Row>
          </div>
        </Content>
      </Page>
     
    );
  }
}
export default ReportBoardHome;
