import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Droppable } from 'react-beautiful-dnd';
import QuickCreateIssue from './QuickCreateIssue';
import IssueList from './IssueList';
import { deBounce } from '../Utils';

const debounceCallback = deBounce(500);

@inject('AppState')
@observer class PIBody extends Component {
  constructor(props) {
    super(props);
  }

  handleCreateIssue(currentType, inputValue) {
    const {
      defaultPriority, AppState, piId, store, refresh,
    } = this.props;
    // 防抖函数
    debounceCallback(() => {
      const req = {
        priorityCode: `priority-${defaultPriority.id}`,
        priorityId: defaultPriority.id,
        projectId: AppState.currentMenuType.id,
        programId: AppState.currentMenuType.id,
        featureDTO: {
          featureType: 'business',
        },
        piId: piId * 1,
        summary: inputValue,
        issueTypeId: currentType.id,
        typeCode: currentType.typeCode,
        /* eslint-disable */
        ...!isNaN(store.getChosenEpic) ? {
          epicId: store.getChosenEpic,
        } : {},
        parentIssueId: 0,
      };
      store.axiosEasyCreateIssue(req).then((res) => {
        this.setState({
          expand: false,
          loading: false,
        });
        refresh();
        // store.createIssue({
        //   ...res,
        //   versionIds: res.versionIssueRelDTOList.length ? [res.versionIssueRelDTOList[0].versionId] : [],
        //   versionNames: res.versionIssueRelDTOList.length ? [res.versionIssueRelDTOList[0].name] : [],
        // }, sprintId);
      }).catch((error) => {
        this.setState({
          loading: false,
        });
      });
    }, this);
  }

  render() {
    const {
      expand, versionVisible, epicVisible,
      issueCount, piId, emptyIssueComponent,
      defaultType, issueType, defaultPriority,
      store, refresh,
    } = this.props;

    return (
      <Droppable
        droppableId={piId}
        isDropDisabled={store.getIssueCantDrag}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={{
              display: expand ? 'block' : 'none',
              background: snapshot.isDraggingOver ? '#e9e9e9' : 'inherit',
              padding: 'grid',
              borderBottom: '1px solid rgba(0,0,0,0.12)',
            }}
          >
            {issueCount ? (
              <IssueList
                sprintItemRef={this.sprintItemRef}
                versionVisible={versionVisible}
                epicVisible={epicVisible}
                piId={piId}
                store={store}
              />
            ) : (emptyIssueComponent)
              }
            {provided.placeholder}
            <QuickCreateIssue
              defaultPriority={defaultPriority}
              piId={piId}
              store={store}
              issueType={issueType}
              defaultType={defaultType}
              refresh={refresh}
              handleCreateIssue={this.handleCreateIssue}
            />
          </div>
        )}
      </Droppable>
    );
  }
}

export default PIBody;
