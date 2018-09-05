import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Page, Header, Content,
} from 'choerodon-front-boot';
import {
  Row, Col, Select, Tooltip,
} from 'choerodon-ui';
import _ from 'lodash';
import { loadSprints } from '../../../../api/NewIssueApi';
import Assignee from '../IterationBoardComponent/Assignee';
import BurnDown from '../IterationBoardComponent/BurnDown';
import Sprint from '../IterationBoardComponent/Sprint';
import Status from '../IterationBoardComponent/Status';
import Remain from '../IterationBoardComponent/Remain';
import Priority from '../IterationBoardComponent/Priority';
import IssueType from '../IterationBoardComponent/IssueType';
import SprintDetails from '../IterationBoardComponent/SprintDetails';

import './IterationBoardHome.scss';

const { Option } = Select;

@observer
class IterationBoardHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sprints: [],
      sprintId: undefined,
      sprintName: undefined,
    };
  }

  componentDidMount() {
    this.loadSprints();
  }

  loadSprints() {
    this.setState({ loading: true });
    loadSprints(['started', 'closed'])
      .then((res) => {
        if (res && !res.length) {
          this.setState({
            loading: false,
            sprints: [],
            sprintId: undefined,
            sprintName: undefined,
          });
        } else {
          this.setState({
            loading: false,
            sprints: res,
            sprintId: res[0].sprintId,
            sprintName: res[0].sprintName,
          });
        }
      });
  }

  handleChangeSprint(sprintId) {
    const { sprints } = this.state;
    const sprint = sprints.find(v => v.sprintId === sprintId);
    this.setState({
      sprintId,
      sprintName: sprint.sprintName,
    });
  }

  renderContent() {
    const {
      loading, sprints, sprintId, sprintName,
    } = this.state;
    if (!loading && sprints && !sprints.length) {
      return (
        <div>
          {'当前项目下无冲刺'}
        </div>
      );
    }
    return (
      <div>
        <Row gutter={20}>
          <Col span={8}>
            <Sprint
              sprintId={sprintId}
              sprintName={sprintName}
              link="backlog"
            />
          </Col>
          <Col span={8}>
            <Status
              sprintId={sprintId}
              link="reporthost/pieReport"
            />
          </Col>
          <Col span={8}>
            <Remain
              sprintId={sprintId}
              link="backlog"
            />
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={24}>
            <BurnDown
              sprintId={sprintId}
              link="reporthost/burndownchart"
            />
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={8}>
            <IssueType 
              sprintId={sprintId}
              link="reporthost/pieReport"
            />
          </Col>

          <Col span={8}>
            <Priority
              sprintId={sprintId}
              link="reporthost/pieReport"
            />
          </Col>
          <Col span={8}>
            <Assignee
              sprintId={sprintId}
              link="reporthost/pieReport"
            />
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={24}>
            <SprintDetails
              sprintId={sprintId}
              link="reporthost/sprintReport"
            />
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { sprints, sprintId, sprintName } = this.state;
    return (
      <Page className="c7n-agile-iterationBoard">
        <Header title="迭代工作台">
          <Select 
            className="select-without-underline"
            value={sprintId}
            style={{
              maxWidth: 120, color: '#3F51B5', margin: '0 30px', fontWeight: 500, lineHeight: '28px', 
            }}
            dropdownStyle={{
              color: '#3F51B5',
              width: 200,
            }}
            onChange={this.handleChangeSprint.bind(this)}
          >
            {
              sprints.map(sprint => (
                <Option key={sprint.sprintId} value={sprint.sprintId}>
                  <Tooltip title={sprint.sprintName}>
                    {sprint.sprintName}
                  </Tooltip>
                </Option>
              ))
            }
          </Select>
        </Header>
        <Content>
          {this.renderContent()}
        </Content>
      </Page>
    );
  }
}

export default IterationBoardHome;
