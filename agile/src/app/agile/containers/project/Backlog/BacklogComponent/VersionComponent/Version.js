import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Modal, Form, Input, DatePicker, Icon } from 'choerodon-ui';
import { Content, stores, Permission } from 'choerodon-front-boot';
import moment from 'moment';
import ReleaseStore from '../../../../../stores/project/release/ReleaseStore';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import VersionItem from './VersionItem';
import './Version.scss';
import CreateVersion from './CreateVersion';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
const { AppState } = stores;

@observer
class Version extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draggableIds: [],
      hoverBlockButton: false,
      addVersion: false,
      loading: false,
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  changeState(value) {
    this.setState({
      draggableIds: value,
    });
  }
  handelClickVersion(type) {
    BacklogStore.setChosenVersion(type);
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  renderVersion() {
    const data = BacklogStore.getVersionData;
    const result = [];
    if (data.length > 0) {
      _.forEach(data, (item, index) => {
        result.push(
          <VersionItem
            data={item}
            index={index}
            handelClickVersion={this.handelClickVersion.bind(this)}
            draggableIds={this.state.draggableIds}
            refresh={this.props.refresh.bind(this)}
            issueRefresh={this.props.issueRefresh.bind(this)}
          />,
        );
      });
    }
    return result;
  }
  render() {
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <div 
        className={this.props.visible ? 'c7n-backlog-version' : ''}
        onMouseEnter={() => {
          this.setState({
            hoverBlockButton: true,
          });
        }}
        onMouseLeave={() => {
          this.setState({
            hoverBlockButton: false,
          });
        }}
      >
        {
          this.props.visible ? (
            <div className="c7n-backlog-versionContent">
              <div className="c7n-backlog-versionTitle">
                <p style={{ fontWeight: 'bold' }}>版本</p>
                <div 
                  className="c7n-backlog-versionRight"
                  style={{
                    display: this.state.hoverBlockButton ? 'flex' : 'none',
                  }}
                >
                  <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.product-version.createVersion']}>
                    <p
                      style={{ color: '#3F51B5', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      role="none"
                      onClick={() => {
                        this.setState({
                          addVersion: true,
                        });
                      }}
                    >创建版本</p>
                  </Permission>
                  <Icon 
                    type="close"
                    role="none"
                    style={{
                      cursor: 'pointer',
                      marginLeft: 6,
                    }}
                    onClick={() => {
                      this.props.changeVisible('versionVisible', false);
                    }}
                  />
                </div>
              </div>
              <div className="c7n-backlog-versionChoice">
                <div 
                  className="c7n-backlog-versionItems" 
                  style={{ 
                    color: '#3F51B5',
                    background: BacklogStore.getChosenVersion === 'all' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'all')}
                >
                  所有问题
                </div>
                {this.renderVersion()}
                <div
                  className={BacklogStore.getIsDragging ? 'c7n-backlog-versionItems c7n-backlog-dragToVersion' : 'c7n-backlog-versionItems'}
                  style={{ 
                    background: BacklogStore.getChosenVersion === 'unset' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'unset')}
                  onMouseUp={() => {
                    if (BacklogStore.getIsDragging) {
                      BacklogStore.axiosUpdateIssuesToVersion(
                        0, this.state.draggableIds).then((res) => {
                        this.props.issueRefresh();
                        this.props.refresh();
                      }).catch((error) => {
                        window.console.log(error);
                        this.props.refresh();
                      });
                    }
                  }}
                >
                  未指定版本的问题
                </div>
              </div>
              <CreateVersion
                visible={this.state.addVersion}
                onCancel={() => {
                  this.setState({
                    addVersion: false,
                  });
                }}
                refresh={this.props.refresh.bind(this)}
              />
            </div>
          ) : ''
        }
      </div>
    );
  }
}

export default Form.create()(Version);

