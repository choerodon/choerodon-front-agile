import React, { Component } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import { Tabs } from 'choerodon-ui';
import { artListLink } from '../../../../common/utils';

const { TabPane } = Tabs;
class CreateArt extends Component {
  render() {
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="create"
          backPath={artListLink()}
        />
        <Content>
          <div>
            create
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Tab 1" key="1">Content of Tab Pane 1</TabPane>
            <TabPane tab="Tab 2" key="2">Content of Tab Pane 2</TabPane>
            <TabPane tab="Tab 3" key="3">Content of Tab Pane 3</TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}

CreateArt.propTypes = {

};

export default CreateArt;
