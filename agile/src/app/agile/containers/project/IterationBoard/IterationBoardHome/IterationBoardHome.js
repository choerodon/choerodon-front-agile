import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, stores } from 'choerodon-front-boot';
import {
  Button, Spin, message, Icon, 
} from 'choerodon-ui';
import _ from 'lodash';

import './IterationBoardHome.scss';

const { AppState } = stores;

@observer
class IterationBoardHome extends Component {
  render() {
    return (
      <Page>
        <Header title="迭代工作台" />
      </Page>
    );
  }
}
export default IterationBoardHome;
