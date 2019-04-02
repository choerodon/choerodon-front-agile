import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Dropdown, Icon, Menu } from 'choerodon-ui';
import IssueNav from './IssueNav';
import TypeTag from '../../../../../../components/TypeTag';

@inject('AppState', 'HeaderStore')
@observer class SprintHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // handleChangeType(type) {
  //   const { issueId, summary, origin } = this.state;
  //   const { issueId: id, onUpdate } = this.props;
  //   const issueupdateTypeDTO = {
  //     epicName: type.key === 'issue_epic' ? summary : undefined,
  //     issueId,
  //     objectVersionNumber: origin.objectVersionNumber,
  //     typeCode: type.key,
  //     issueTypeId: type.item.props.value,
  //   };
  //   updateIssueType(issueupdateTypeDTO)
  //     .then((res) => {
  //       loadIssue(id).then((response) => {
  //         this.setState({
  //           createdById: res.createdBy,
  //         });
  //         this.reloadIssue(origin.issueId);
  //         onUpdate();
  //       });
  //     });
  // }

  render() {
    const {
      store,
    } = this.props;

    const issueTypeData = store.getIssueTypes ? store.getIssueTypes : [];
    const issue = store.getIssue;
    const { issueTypeDTO = {} } = issue;

    const typeList = (
      <Menu
        style={{
          background: '#fff',
          boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '2px',
        }}
        // onClick={this.handleChangeType.bind(this)}
      >
        {
          issueTypeData.map(t => (
            <Menu.Item key={t.typeCode} value={t.id}>
              <TypeTag
                data={t}
                showName
              />
            </Menu.Item>
          ))
        }
      </Menu>
    );

    return (
      <div className="c7n-nav">
        {/* 转换类型 */}
        <div>
          <Dropdown overlay={typeList} trigger={['click']} disabled={issueTypeDTO.code === 'sub_task'}>
            <div
              style={{
                height: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TypeTag
                data={issueTypeDTO}
              />
              <Icon
                type="arrow_drop_down"
                style={{ fontSize: 16 }}
              />
            </div>
          </Dropdown>
        </div>
        {/* 锚点 */}
        <IssueNav typeCode={issueTypeDTO.code} />
      </div>
    );
  }
}

export default SprintHeader;
