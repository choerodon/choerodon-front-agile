{mode === 'none' && (<React.Fragment>
  <div className="swimlane-title">
    <p>issue</p>
    <div style={{ display: 'flex' }}>
      <p className="point-span" style={{ background: '#4D90FE' }}>
        {_.reduce(issues, (sum, issue) => {
          if (issue.statusCode === 'todo') {
            return sum + issue.storyPoints;
          } else {
            return sum;
          }
        }, 0)}
      </p>
      <p className="point-span" style={{ background: '#FFB100' }}>
        {_.reduce(issues, (sum, issue) => {
          if (issue.statusCode === 'doing') {
            return sum + issue.storyPoints;
          } else {
            return sum;
          }
        }, 0)}
      </p>
      <p className="point-span" style={{ background: '#00BFA5' }}>
        {_.reduce(issues, (sum, issue) => {
          if (issue.statusCode === 'done') {
            return sum + issue.storyPoints;
          } else {
            return sum;
          }
        }, 0)}
      </p>
      <p onClick={this.expandColumn.bind(this, '-1-none')} role="none">
        <Icon type={`${this.state.expandColumns.includes('-1-none') ? 'baseline-arrow_right' : 'baseline-arrow_drop_down'}`} />
      </p>

    </div>
  </div>
  <div style={{ display: this.state.expandColumns.includes('-1-none') ? 'none' : 'flex' }}>
    {epicData.map((epic, index) => (<div className="swimlane-column">
      {_.filter(issues, issue => issue.epicId === epic.issueId).map(item => (
        <IssueCard
          key={item.issueId}
          issue={item}
        />
      ))}
      <div style={{ background: this.state.hoverId === epic.issueId ? '#f5f5f5' : 'rgba(0, 0, 0, 0.02)' }} onMouseOver={this.handleMouseColumn.bind(this, epic.issueId)}>
        <div style={{ display: this.state.hoverId === epic.issueId ? 'block' : 'none' }}>add <a role="none" onClick={this.showCreateIssue}>new</a>or <a role="none" onClick={this.showBackLog}>existing</a></div>
        <CreateIssue visibile={this.state.createIssue} />
      </div>
    </div>))}

  </div>
</React.Fragment>)
}
{mode === 'sprint' && issues.length &&
<React.Fragment>
  {sprints.map(sprint => (<React.Fragment key={sprint.sprintId}>
    <div className="swimlane-title">
      <p>{sprint.sprintName}</p>
      <div style={{ display: 'flex' }}>
        <p className="point-span" style={{ background: '#4D90FE' }}>
          {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
            if (issue.statusCode === 'todo') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#FFB100' }}>
          {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
            if (issue.statusCode === 'doing') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#00BFA5' }}>
          {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
            if (issue.statusCode === 'done') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p onClick={this.expandColumn.bind(this, sprint.sprintId)} role="none">
          <Icon type={`${this.state.expandColumns.includes(sprint.sprintId) ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
        </p>

      </div>
    </div>
    <div style={{ display: this.state.expandColumns.includes(sprint.sprintId) ? 'none' : 'flex' }}>
      {epicData.map((epic, index) => (<div className="swimlane-column">
        <React.Fragment>
          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.sprintId === sprint.sprintId).map(item => (
            <IssueCard
              key={item.issueId}
              issue={item}
            />
          ))}
        </React.Fragment>
      </div>))}
    </div>
  </React.Fragment>))}
  <React.Fragment key={'no-sprint'}>
    <div className="swimlane-title">
      <p>
        未计划的
        <Button className="createSpringBtn" functyp="flat" onClick={this.handleCreateVOS.bind(this, 'sprint')}>
          <Icon type="playlist_add" />
          创建冲刺
        </Button>
      </p>
      <div style={{ display: 'flex' }}>
        <p className="point-span" style={{ background: '#4D90FE' }}>
          {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
            if (issue.statusCode === 'todo') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#FFB100' }}>
          {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
            if (issue.statusCode === 'doing') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#00BFA5' }}>
          {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
            if (issue.statusCode === 'done') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p onClick={this.expandColumn.bind(this, '-1-sprint')} role="none">
          <Icon type={`${this.state.expandColumns.includes('-1-sprint') ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
        </p>

      </div>
    </div>
    <div style={{ display: this.state.expandColumns.includes('-1-sprint') ? 'none' : 'flex' }}>
      {epicData.map((epic, index) => (<div className="swimlane-column">
        <React.Fragment>
          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.sprintId == null).map(item => (
            <IssueCard
              key={item.issueId}
              issue={item}
            />
          ))}
        </React.Fragment>
      </div>))}
    </div>
  </React.Fragment>
</React.Fragment>
}
{mode === 'version' && issues.length && <React.Fragment>
  {versions.map(version => (<React.Fragment key={version.versionId}>
    <div className="swimlane-title">
      <p>{version.name}</p>
      <div style={{ display: 'flex' }}>
        <p className="point-span" style={{ background: '#4D90FE' }}>
          {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
            if (issue.statusCode === 'todo') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#FFB100' }}>
          {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
            if (issue.statusCode === 'doing') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#00BFA5' }}>
          {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
            if (issue.statusCode === 'done') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p onClick={this.expandColumn.bind(this, version.versionId)} role="none">
          <Icon type={`${this.state.expandColumns.includes(version.versionId) ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
        </p>

      </div>
    </div>
    <div style={{ display: this.state.expandColumns.includes(version.versionId) ? 'none' : 'flex' }}>
      {epicData.map((epic, index) => (<div className="swimlane-column">
        <React.Fragment>
          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.versionId === version.versionId).map(item => (
            <IssueCard
              key={item.issueId}
              issue={item}
            />
          ))}
        </React.Fragment>
      </div>))}
    </div>
  </React.Fragment>))}
  <React.Fragment key={'no-version'}>
    <div className="swimlane-title">
      <p>
        未计划的
        <Button className="createVersionBtn" functyp="flat" onClick={this.handleCreateVOS.bind(this, 'version')}>
          <Icon type="playlist_add" />
          创建版本
        </Button>
      </p>
      <div style={{ display: 'flex' }}>
        <p className="point-span" style={{ background: '#4D90FE' }}>
          {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
            if (issue.statusCode === 'todo') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#FFB100' }}>
          {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
            if (issue.statusCode === 'doing') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p className="point-span" style={{ background: '#00BFA5' }}>
          {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
            if (issue.statusCode === 'done') {
              return sum + issue.storyPoints;
            } else {
              return sum;
            }
          }, 0)}
        </p>
        <p onClick={this.expandColumn.bind(this, '-1-version')} role="none">
          <Icon type={`${this.state.expandColumns.includes('-1-version') ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
        </p>

      </div>
    </div>
    <div style={{ display: this.state.expandColumns.includes('-1-version') ? 'none' : 'flex' }}>
      {epicData.map((epic, index) => (<div className="swimlane-column">
        <React.Fragment>
          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.versionId == null).map(item => (
            <IssueCard
              key={item.isssueId}
              issue={item}
            />
          ))}
        </React.Fragment>
      </div>))}
    </div>
  </React.Fragment>
</React.Fragment>
}
