import React, { Component } from 'react';
import { stores } from 'choerodon-front-boot';
import Card from '../Card';
import Assignee from './Assignee';

const { AppState } = stores;

class AssigneeWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <Card
        title={'经办人分布'}
      >
        <Assignee />
      </Card>
    );
  }
}
export default AssigneeWrap;
