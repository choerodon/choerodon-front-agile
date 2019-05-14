import {
  observable, action, computed, toJS,
} from 'mobx';
import axios from 'axios';
import { find, findIndex } from 'lodash';
import { stores } from 'choerodon-front-boot';

const { AppState } = stores;
const sprints = [{
  id: 1,
  name: 'Sprint-20',
  width: 2,
}, {
  id: 2,
  name: 'Sprint-21',
  width: 1,
}, {
  id: 3,
  name: 'Sprint-22',
  width: 1,
}];
const data = [{
  projectName: '产品运营',  
  sprints: [{
    id: 1,
    name: 'Sprint-20',
    width: 2,
    issues: [{
      issueId: 1,
      summary: '1',
    }, {
      issueId: 1,
      summary: '2',
    }, {
      issueId: 1,
      summary: '3',
    }],
  }, {
    id: 2,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }, {
    id: 3,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }],
}, {
  projectName: '产品运营',  
  sprints: [{
    id: 1,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }, {
    id: 2,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }, {
    id: 3,
    name: 'Sprint-20',
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }],
}, {
  projectName: '产品运营',  
  sprints: [{
    id: 1,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }, {
    id: 2,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }, {
    id: 3,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }],
}, {
  projectName: '产品运营',
  sprints: [{
    id: 1,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }, {
    id: 2,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }, {
    id: 3,
    name: 'Sprint-20',
    width: 1,
    issues: [{
      issueId: 1,
      summary: '1',
    }],
  }],
}];

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
class BoardStore {
  @observable projects = [];

  @observable sprints = [];

  @observable connections = [];

  @observable issueRefs = new Map();

  @observable currentSprint = {};

  loadData=() => {
    this.init(data, sprints);
  }

  @action init = (projects, sprints, connections) => {
    this.sprints = sprints;
    this.projects = projects;
    this.connections = connections;
    this.issueRefs = new Map(projects.map((project => ([project.id, new Map(project.sprints.map(sprint => [sprint.id, new Map()]))]))));
    console.log(this.issueRefs);
  }

  @action setIssueRef(sprintId, projectId, issueId, element) {
    this.issueRefs.get(projectId).get(sprintId).set(issueId, element);
  }

  @action setCurrentSprint(currentSprint) {
    this.currentSprint = currentSprint;
  }
}


export default new BoardStore();
