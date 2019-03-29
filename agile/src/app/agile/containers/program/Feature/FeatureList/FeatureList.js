import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, Spin, Icon } from 'choerodon-ui';
import {
  Header, Page,
} from 'choerodon-front-boot';
import './FeatureList.scss';
import { DragDropContext } from 'react-beautiful-dnd';
// import ClearFilter from '../FeatureComponent/SprintComponent/SprintItemComponent/SprintHeaderComponent/ClearAllFilter';
import FeatureDetail from '../FeatureComponent/FeatureDetail/FeatureDetail';
import CreateFeature from '../FeatureComponent/CreateFeature/CreateFeature';
import FeatureStore from '../../../../stores/Program/Feature/FeatureStore';
import Epic from '../FeatureComponent/EpicComponent/Epic';
import SprintItem from '../FeatureComponent/SprintComponent/PIItem';

@inject('HeaderStore')
@observer
class FeatureList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillUnmount() {
    FeatureStore.setEpicVisible(false);
  }

  refresh = () => {
    Promise.all([
      FeatureStore.axiosGetIssueTypes(),
      FeatureStore.axiosGetDefaultPriority(),
      FeatureStore.getCurrentEpicList(),
      FeatureStore.getFeatureListData(),
    ]).then(([issueTypes, defaultPriority, epics, featureList]) => {
      FeatureStore.initData(issueTypes, defaultPriority, epics, featureList);
    });
  };

  onEpicClick = () => {
    FeatureStore.getFeatureListData().then((res) => {
      FeatureStore.setSprintData(res);
    }).catch((error) => {
    });
  };

  handleCreateBtn = () => {
    this.setState({
      visible: true,
    });
  };

  handleCancelBtn = () => {
    this.setState({
      visible: false,
    });
  };

  handleCreateFeature = () => {
    this.setState({
      visible: false,
    });
    this.refresh();
  };

  render() {
    const { visible } = this.state;
    const { HeaderStore } = this.props;

    return (
      <Page className="c7n-agile-EditArt">
        <Header
          title="特性列表"
        >
          <Button
            className="leftBtn"
            funcType="flat"
            onClick={this.handleCreateBtn}
          >
            <Icon type="playlist_add icon" />
            <span>创建特性</span>
          </Button>
          <Button
            className="leftBtn2"
            functyp="flat"
            onClick={() => {
              this.refresh();
            }}
          >
            <Icon type="refresh" />
            {'刷新'}
          </Button>
        </Header>
        {/* <div */}
        {/* className="backlogTools" */}
        {/* style={{ */}
        {/* paddingLeft: 24, display: 'flex', alignItems: 'center', */}
        {/* }} */}
        {/* > */}
        {/* <QuickSearch */}
        {/* onQuickSearchChange={this.onQuickSearchChange} */}
        {/* resetFilter={BacklogStore.getQuickSearchClean} */}
        {/* onAssigneeChange={this.onAssigneeChange} */}
        {/* /> */}
        {/* <ClearFilter /> */}
        {/* </div> */}
        <div style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            className="c7n-backlog"
            style={{
              height: HeaderStore.announcementClosed ? 'calc(100vh - 106px)' : 'calc(100vh - 158px)',
            }}
          >
            <div className="c7n-backlog-side">
              <p
                style={{
                  marginTop: 12,
                }}
                role="none"
                onClick={() => {
                  FeatureStore.toggleVisible();
                }}
              >
                {'史诗'}
              </p>
            </div>
            <Epic
              refresh={this.refresh}
              visible={FeatureStore.getEpicVisible}
              store={FeatureStore}
              issueRefresh={() => {
                this.IssueDetail.refreshIssueDetail();
              }}
              onEpicClick={this.onEpicClick}
            />
            <Spin spinning={FeatureStore.getSpinIf}>
              <div className="c7n-backlog-content">
                <DragDropContext
                  onDragEnd={(result) => {
                    FeatureStore.setIsDragging(null);
                    const { destination, source, draggableId } = result;
                    if (destination) {
                      const { droppableId: destinationId, index: destinationIndex } = destination;
                      const { droppableId: sourceId, index: sourceIndex } = source;
                      if (destinationId === sourceId && destinationIndex === sourceIndex) {
                        return;
                      }
                      if (result.reason !== 'CANCEL') {
                        const item = FeatureStore.getIssueMap.get(sourceId)[sourceIndex];
                        const destinationArr = FeatureStore.getIssueMap.get(destinationId);
                        let destinationItem;
                        if (destinationIndex === 0) {
                          destinationItem = null;
                        } else if (destinationIndex === FeatureStore.getIssueMap.get(destinationId).length) {
                          destinationItem = destinationArr[destinationIndex - 1];
                        } else {
                          destinationItem = destinationArr[destinationIndex];
                        }
                        if (FeatureStore.getMultiSelected.size > 1 && !FeatureStore.getMultiSelected.has(destinationItem)) {
                          FeatureStore.moveSingleIssue(destinationId, destinationIndex, sourceId, sourceIndex, draggableId, item, 'multi');
                        } else {
                          FeatureStore.moveSingleIssue(destinationId, destinationIndex, sourceId, sourceIndex, draggableId, item, 'single');
                        }
                      }
                    }
                  }}
                  onDragStart={(result) => {
                    const { source } = result;
                    const { droppableId: sourceId, index: sourceIndex } = source;
                    const item = FeatureStore.getIssueMap.get(sourceId)[sourceIndex];
                    FeatureStore.setIsDragging(item.issueId);
                    FeatureStore.setIssueWithEpic(item);
                  }}
                >
                  <SprintItem
                    epicVisible={FeatureStore.getEpicVisible}
                    onRef={(ref) => {
                      this.sprintItemRef = ref;
                    }}
                    refresh={this.refresh}
                    store={FeatureStore}
                    type="pi"
                  />
                </DragDropContext>
                <CreateFeature
                  visible={visible}
                  onCancel={this.handleCancelBtn}
                  onOk={this.handleCreateFeature}
                />
              </div>
            </Spin>
            <FeatureDetail
              store={FeatureStore}
              refresh={this.refresh}
              onRef={(ref) => {
                this.IssueDetail = ref;
              }}
              cancelCallback={this.resetSprintChose}
            />
          </div>
        </div>
      </Page>
    );
  }
}

export default FeatureList;
