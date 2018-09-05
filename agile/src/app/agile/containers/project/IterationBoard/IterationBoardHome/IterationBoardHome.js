import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Row, Col, Select, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import { loadSprints } from '../../../../api/NewIssueApi';
import Assignee from '../IterationBoardComponent/Assignee';
import BurnDown from '../IterationBoardComponent/BurnDown';
import Sprint from '../IterationBoardComponent/Sprint';
import Status from '../IterationBoardComponent/Status';
import Remain from '../IterationBoardComponent/Remain';
import Priority from '../IterationBoardComponent/Priority';

import './IterationBoardHome.scss';

const { AppState } = stores;
const { Option } = Select;

@observer
class IterationBoardHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      sprints: [],
      sprintId: undefined,
      sprintName: undefined,
    };
  }

  componentDidMount() {
    this.loadSprints();
  }

  loadSprints() {
    loadSprints(['started', 'closed'])
      .then((res) => {
        if (res && !res.length) {
          this.setState({
            loading: false,
            sprints: [],
            sprintId: undefined,
            sprintName: undefined,
          });
        }
        this.setState({
          loading: false,
          sprints: res,
          sprintId: res[0].sprintId,
          sprintName: res[0].sprintName,
        });
      })
  }

  handleChangeSprint(sprintId) {
    const { sprints } = this.state;
    const sprint = sprints.find(v => v.sprintId === sprintId);
    this.setState({
      sprintId,
      sprintName: sprint.sprintName,
    });
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
          <Row gutter={20}>
            <Col span={8}>
              <Sprint
                sprintId={sprintId}
                sprintName={sprintName}
              />
            </Col>
            <Col span={8}>
              <Status
                sprintId={sprintId}
              />
            </Col>
            <Col span={8}>
              <Remain
                sprintId={sprintId}
              />
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={24}>
              <BurnDown
                sprintId={sprintId}
              />
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={8}>
              <Priority
                sprintId={sprintId}
              />
            </Col>
            <Col span={8}>
              <Assignee
                sprintId={sprintId}
              />
            </Col>
          </Row>
        </Content>
      </Page>
    );
  }
}
export default IterationBoardHome;
