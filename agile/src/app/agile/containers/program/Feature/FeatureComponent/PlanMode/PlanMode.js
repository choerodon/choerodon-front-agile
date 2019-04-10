import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { Spin } from 'choerodon-ui';
import {
  Header, Page,
} from 'choerodon-front-boot';
import { DragDropContext } from 'react-beautiful-dnd';
import FeatureStore from '../../../../../stores/Program/Feature/FeatureStore';
import Epic from '../EpicComponent/Epic';
import SprintItem from '../PIComponent/PIItem';
// import './FeatureList.scss';


@observer
class PlanMode extends Component {
  componentDidMount() {
    this.refresh();
  }

  componentWillUnmount() {
    FeatureStore.setEpicVisible(false);
    FeatureStore.setClickIssueDetail({});
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
      FeatureStore.setFeatureData(res);
    }).catch(() => {
    });
  };

  render() {
    const { issueFresh } = this.props;
    return (
      <Fragment>
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
          issueRefresh={issueFresh}
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
          </div>
        </Spin>
      </Fragment>
    );
  }
}

export default PlanMode;
