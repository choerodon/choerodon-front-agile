import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Droppable } from 'react-beautiful-dnd';
import BacklogStore from '../../../../../../stores/project/backlog/BacklogStore';
import QuickCreateIssue from './QuickCreateIssue';
import IssueList from './IssueList';
import { deBounce } from '../Utils';

const debounceCallback = deBounce(500);

@inject('AppState')
@observer class SprintBody extends Component {
  handleCreateIssue(currentType, inputValue) {
    const { defaultPriority, AppState, sprintId } = this.props;
    // 防抖函数
    debounceCallback(() => {
      const req = {
        priorityCode: `priority-${defaultPriority.id}`,
        priorityId: defaultPriority.id,
        projectId: AppState.currentMenuType.id,
        sprintId: sprintId * 1,
        summary: inputValue,
        issueTypeId: currentType.id,
        typeCode: currentType.typeCode,
        /* eslint-disable */
        ...!isNaN(BacklogStore.getChosenEpic) ? {
          epicId: BacklogStore.getChosenEpic,
        } : {},
        ...!isNaN(BacklogStore.getChosenVersion) ? {
          versionIssueRelDTOList: [
            {
              versionId: BacklogStore.getChosenVersion,
            },
          ],
        } : {},
        parentIssueId: 0,
      };
      BacklogStore.axiosEasyCreateIssue(req).then((res) => {
        this.setState({
          expand: false,
          loading: false,
        });
        BacklogStore.createIssue({
          ...res,
          versionIds: res.versionIssueRelDTOList.length ? [res.versionIssueRelDTOList[0].versionId] : [],
          versionNames: res.versionIssueRelDTOList.length ? [res.versionIssueRelDTOList[0].name] : [],
        }, sprintId);
      }).catch((error) => {
        this.setState({
          loading: false,
        });
      });
    }, this);
    /* eslint-enable */
  }

  render() {
    const {
      expand, versionVisible, epicVisible,
      issueCount, sprintId, EmptyIssueComponent,
      defaultType, issueType, defaultPriority,
      isCreated,
    } = this.props;

    return (
      <Droppable
        droppableId={sprintId}
        isDropDisabled={BacklogStore.getIssueCantDrag}
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
                sprintId={sprintId}
              />
            ) : <EmptyIssueComponent />
              }
            {provided.placeholder}
            <QuickCreateIssue
              defaultPriority={defaultPriority}
              sprintId={sprintId}
              issueType={issueType}
              defaultType={defaultType}
              handleCreateIssue={this.handleCreateIssue}
            />
          </div>
        )}
      </Droppable>
    );
  }
}

export default SprintBody;
