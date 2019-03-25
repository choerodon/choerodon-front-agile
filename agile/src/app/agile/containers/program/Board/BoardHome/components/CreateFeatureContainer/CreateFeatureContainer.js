import React, { Component } from 'react';
import { observer } from 'mobx-react';
import CreateFeature from '../../../../../../components/CreateFeature';
import BoardStore from '../../../../../../stores/Program/Board/BoardStore';
import { handleFileUpload, beforeTextUpload } from '../../../../../../common/utils';


@observer
class CreateFeatureContainer extends Component {
  handleCancel=() => {
    BoardStore.setCreateFeatureVisible(false);
  }

  handleSubmit=(values) => {
    console.log(values);
    // const deltaOps = delta;
    //     if (deltaOps) {
    //       beforeTextUpload(deltaOps, extra, this.handleSave);
    //     } else {
    //       extra.description = '';
    //       this.handleSave(extra);
    //     }
    // createIssue(data)
    //   .then((res) => {
    //     if (fileList.length > 0) {
    //       const config = {
    //         issueType: res.statusId,
    //         issueId: res.issueId,
    //         fileName: fileList[0].name,
    //         projectId: AppState.currentMenuType.id,
    //       };
    //       if (fileList.some(one => !one.url)) {
    //         handleFileUpload(fileList, callback, config);
    //       }
    //     }
    //     onOk(res);
    //   })
    //   .catch(() => {
    //     onOk();
    //   });
  }

  render() {
    const visible = BoardStore.createFeatureVisible;
    return <CreateFeature visible={visible} onCancel={this.handleCancel} onSubmit={this.handleSubmit} />;
  }
} 

export default CreateFeatureContainer;
