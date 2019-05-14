import {
  observable, action, computed, toJS, extendObservable,
} from 'mobx';
import axios from 'axios';
import { find, findIndex, max } from 'lodash';
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
  id: 1,
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
  id: 2,
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
  id: 3,
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
  id: 4,
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
    projectId: 1,
    sprintId: 1,
    issueId: 1,
  },
  to: {
    projectId: 2,
    sprintId: 1,
    issueId: 1,
  },
}, {
  from: {
    projectId: 1,
    sprintId: 1,
    issueId: 1,
  },
  to: {
    projectId: 2,
    sprintId: 2,
    issueId: 1,
  },
}];
class BoardStore {
  @observable projects = [];

  @observable sprints = [];

  @observable connections = [];

  @observable issueRefs = null;

  @observable currentSprint = {};

  loadData = () => {
    this.init(data, sprints, connections);
  }

  @action init = (projects, sprints, connections) => {
    this.sprints = sprints;
    this.projects = [{
      id: 1,
      projectName: '产品运营',
      sprints: [{
        id: 1,
        name: 'Sprint-20',
        width: 2,
        issues: [{
          issueId: 1,
          summary: '1',
        }, {
          issueId: 2,
          summary: '2',
        }, {
          issueId: 3,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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
    this.connections = connections;
    // this.issueRefs = new Map(projects.map((project => ([project.id, new Map(project.sprints.map(sprint => [sprint.id, new Map()]))]))));
    
    console.log(this.issueRefs);
  }

  // @action setIssueRef({
  //   projectId, sprintId, issueId, element,
  // }) {
  //   this.issueRefs.get(projectId).get(sprintId).set(issueId, element);
  //   // console.log(this.issueRefs.get(projectId).get(sprintId).get(issueId));
  //   const targetProject = find(this.projects, { id: projectId });
  //   const targetSprint = find(targetProject.sprints, { id: sprintId });
  //   const targetIssue = find(targetSprint.issues, { issueId });
  //   // console.log(targetIssue);
  //   if (targetIssue.element) {
  //     targetIssue.element = element;
  //   } else {
  //     extendObservable(targetIssue, { element });
  //   }
  // }

  @action test() {
    this.sprints[0].width = 3 - this.sprints[0].width;
  }

  @action setCurrentSprint(currentSprint) {
    this.currentSprint = currentSprint;
  }

  // getIssueRef({ projectId, sprintId, issueId }) {
  //   return this.issueRefs.get(projectId).get(sprintId).get(issueId);
  //   const targetProject = find(this.projects, { id: projectId });
  //   const targetSprint = find(targetProject.sprints, { id: sprintId });
  //   const targetIssue = find(targetSprint.issues, { issueId });
  //   return targetIssue;
  // }

  @computed get getProjectsHeight() {
    return this.projects.map((project) => {
      const { sprints } = project;
      const maxHeight = max(sprints.map((sprint, i) => Math.ceil(sprint.issues.length / this.sprints[i].width)));
      return maxHeight;
    });
  }
}


export default new BoardStore();
