import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Spin } from 'choerodon-ui';
import {
  Content, Header, Page, store,
} from 'choerodon-front-boot';
import { DragDropContext } from 'react-beautiful-dnd';
// import SprintItem from './Backlog/BacklogComponent/SprintComponent/SprintItem';
import CreateFeature from '../CreateFeature';
import { artListLink } from '../../../../common/utils';
import { ArtInfo, ArtSetting, ReleaseArt } from '../../Art/EditArt/components';
import QuickSearch from '../../../../components/QuickSearch';
import Injecter from '../../../../components/Injecter';
import CreateIssue from '../../../../components/CreateIssueNew';
import FeatureDetail from '../FeatureDetail/FeatureDetail';
import FeatureStore from '../../../../stores/Program/PI/FeatureStore';

@observer
class FeatureList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createFeatureVisible: false,
    };
  }

  componentDidMount() {
    Promise.all(FeatureStore.getCurrentEpicList(), FeatureStore.getFeatureListData())
      .then((featureList, epicList) => {
      });
  }

  handleCreateFeatureBtnClick = () => {
    this.setState({
      createFeatureVisible: true,
    });
  }

  onOKOrCancel = () => {
    this.setState({
      createFeatureVisible: false,
    });
  }

  render() {
    const { createFeatureVisible } = this.state;
    return (
      <Page className="c7nagile-EditArt">
        <Header
          title="特性列表"
          backPath={artListLink()}
        >
          <Button onClick={this.handleCreateFeatureBtnClick}>
            {'打开侧边栏'}
          </Button>
        </Header>
        <Content>
          <div>
            <CreateFeature
              visible={createFeatureVisible}
              callback={this.onOKOrCancel}
            />
          </div>
          <div style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="backlogTools" style={{ paddingLeft: 24 }}>
              <QuickSearch
                onQuickSearchChange={this.onQuickSearchChange}
                // resetFilter={BacklogStore.getQuickSearchClean}
                onAssigneeChange={this.onAssigneeChange}
              />
            </div>
            <div className="c7n-backlog">
              <div className="c7n-backlog-side">
                <p
                  style={{
                    marginTop: 12,
                  }}
                  role="none"
                  onClick={() => {
                    this.loadEpic();
                    this.setState({
                      epicVisible: true,
                    });
                  }}
                >
                  {'史诗'}
                </p>
              </div>
              <div className="c7n-backlog-content">
                <div style={{ display: 'flex', flexGrow: 1 }}>
                  {/* <Epic */}
                  {/* store={BacklogStore} */}
                  {/* onRef={(ref) => { */}
                  {/* this.epicRef = ref; */}
                  {/* }} */}
                  {/* refresh={this.refresh} */}
                  {/* visible={epicVisible} */}
                  {/* changeVisible={this.changeState} */}
                  {/* issueRefresh={() => { */}
                  {/* this.IssueDetail.refreshIssueDetail(); */}
                  {/* }} */}
                  {/* /> */}
                  <DragDropContext
                    onDragEnd={(result) => {

                    }}
                    onDragStart={(result) => {

                    }}
                  >
                    <div
                      role="none"
                      className="c7n-backlog-sprint"
                    >
                      <Spin spinning={FeatureStore.getSpinIf}>
                        {/* <SprintItem */}
                        {/* store={BacklogStore} */}
                        {/* loading={spinIf} */}
                        {/* epicVisible={epicVisible} */}
                        {/* versionVisible={versionVisible} */}
                        {/* onRef={(ref) => { */}
                        {/* this.sprintItemRef = ref; */}
                        {/* }} */}
                        {/* refresh={this.refresh} */}
                        {/* /> */}
                      </Spin>
                    </div>
                  </DragDropContext>
                </div>
                {/* <FeatureDetail
                  visible={JSON.stringify(FeatureStore.getClickIssueDetail) !== '{}'}
                  refresh={this.refresh}
                  onRef={(ref) => {
                    this.IssueDetail = ref;
                  }}
                  cancelCallback={this.resetSprintChose}
                /> */}
                <CreateIssue
                  // visible={visible}
                  // onCancel={() => {
                  //   BacklogStore.setNewIssueVisible(false);
                  // }}
                  onOk={this.handleCreateIssue}
                />
              </div>
            </div>
          </div>
        </Content>
      </Page>
    );
  }
}

export default FeatureList;
