import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Button, Spin, Icon, Radio,
} from 'choerodon-ui';
import {
  Header, Page,
} from 'choerodon-front-boot';
import './FeatureList.scss';
import { DragDropContext } from 'react-beautiful-dnd';
// import ClearFilter from '../FeatureComponent/SprintComponent/SprintItemComponent/SprintHeaderComponent/ClearAllFilter';
import FeatureDetail from '../FeatureComponent/FeatureDetail/FeatureDetail';
import CreateFeature from '../FeatureComponent/CreateFeature/CreateFeature';
import FeatureStore from '../../../../stores/program/Feature/FeatureStore';
import Epic from '../FeatureComponent/EpicComponent/Epic';
import SprintItem from '../FeatureComponent/PIComponent/PIItem';
import PlanMode from '../FeatureComponent/PlanMode';
import QueryMode from '../FeatureComponent/QueryMode/QueryMode';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
@inject('HeaderStore')
@observer
class FeatureList extends Component {
  state = {
    visible: false,
    mode: 'plan',
  }

  componentDidMount() {
    this.refresh();
  }

  saveRef = name => (ref) => {
    this[name] = ref;
  }

  refresh = () => {
    if (this.PlanMode) {
      this.PlanMode.refresh();
    } else {
      this.QueryMode.refresh();
    }
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

  handleModeChange = (e) => {
    this.setState({
      mode: e.target.value,
    });
  }

  render() {
    const { visible, mode } = this.state;
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
          <div style={{ flex: 1, visibility: 'hidden' }} />
          <RadioGroup className="c7n-pi-showTypeRadioGroup" style={{ marginRight: 24 }} onChange={this.handleModeChange} value={mode}>
            <RadioButton value="plan">计划模式</RadioButton>
            <RadioButton value="query">查询模式</RadioButton>
          </RadioGroup>
        </Header>
        <div style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            className="c7n-backlog"
            style={{
              height: HeaderStore.announcementClosed ? 'calc(100vh - 106px)' : 'calc(100vh - 158px)',
            }}
          >
            {mode === 'plan' ? (
              <PlanMode
                issueRefresh={() => { this.IssueDetail.refreshIssueDetail(); }}
                ref={this.saveRef('PlanMode')}
              />
            ) : <QueryMode ref={this.saveRef('QueryMode')} />}
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
        <CreateFeature
          visible={visible}
          onCancel={this.handleCancelBtn}
          onOk={this.handleCreateFeature}
        />
      </Page>
    );
  }
}

export default FeatureList;
