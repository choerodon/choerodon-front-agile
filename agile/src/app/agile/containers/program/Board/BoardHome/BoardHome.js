import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  Page, Header, stores, Content,
} from 'choerodon-front-boot';
import { Button, Spin } from 'choerodon-ui';
import BoardStore from '../../../../stores/program/Board/BoardStore';
import Connectors from './components/Connectors';
import BoardBody from './components/BoardBody';
import './BoardHome.scss';

const connections = [{
  from: {
    projectIndex: 1,
    sprintIndex: 1,
    columnIndex: 0,
    issueIndex: 0,
  },
  to: {
    projectIndex: 0,
    sprintIndex: 0,
    columnIndex: 0,
    issueIndex: 0,
  },  
}, {
  from: {
    projectIndex: 1,
    sprintIndex: 2,
    columnIndex: 0,
    issueIndex: 0,
  },
  to: {
    projectIndex: 0,
    sprintIndex: 0,
    columnIndex: 0,
    issueIndex: 0,
  },  
}, {
  from: {
    projectIndex: 1,
    sprintIndex: 0,
    columnIndex: 0,
    issueIndex: 0,
  },
  to: {
    projectIndex: 0,
    sprintIndex: 1,
    columnIndex: 0,
    issueIndex: 0,
  },  
}, {
  from: {
    projectIndex: 1,
    sprintIndex: 0,
    columnIndex: 0,
    issueIndex: 0,
  },
  to: {
    projectIndex: 0,
    sprintIndex: 2,
    columnIndex: 0,
    issueIndex: 0,
  },  
}];
@observer
class BoardHome extends Component {
  componentDidMount() {
    BoardStore.loadData();
  }
  
  render() {
    const { projects, sprints } = BoardStore;

    return (
      <Page
        className="c7nagile-BoardHome"
      >
        <Header title="项目群公告板">         
          <Button        
            icon="refresh"
            onClick={this.handleRefresh}
          >
          刷新
          </Button>
        </Header>
        <Content style={{ padding: 0 }}>
          <BoardBody projects={projects} sprints={sprints} />          
          <Connectors connections={connections} />
        </Content>
      </Page>
    );
  }
}

BoardHome.propTypes = {

};

export default BoardHome;
