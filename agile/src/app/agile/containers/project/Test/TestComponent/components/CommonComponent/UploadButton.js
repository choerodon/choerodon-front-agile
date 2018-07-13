/**
 * 上传组件的通用组件，该组件生成需要具备
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Button, Icon } from 'choerodon-ui';
import { deleteFile } from '../../api/FileApi';

class UploadButton extends React.Component {
  static propTypes = {
    onRemove: PropTypes.func,
    beforeUpload: PropTypes.func,
  };
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  onRemove = fileList => (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    if (file.url && this.props.onRemove) {
      deleteFile(file.uid)
        .then((response) => {
          if (response) {
            newFileList.splice(index, 1);
            this.props.onRemove(newFileList);
            Choerodon.prompt('删除成功');
          }
        })
        .catch((error) => {
          if (error.response) {
            Choerodon.prompt(error.response.data.message);
          } else {
            Choerodon.prompt(error.message);
          }
        });
    } else {
      newFileList.splice(index, 1);
      this.props.onRemove(newFileList);
    }
  };

  beforeUpload = fileList => (file) => {
    if (file.size > 1024 * 1024 * 30) {
      Choerodon.prompt('文件不能超过30M');
      return false;
    } else if (fileList.length >= 10) {
      Choerodon.prompt('最多上传10个文件');
      return false;
    } else {
      const tmp = file;
      tmp.status = 'done';
      if (this.props.onBeforeUpload) {
        if (fileList.length > 0) {
          this.props.onBeforeUpload(fileList.slice().concat(file));
        } else {
          this.props.onBeforeUpload([file]);
        }
      }
    }
    return false;
  };

  render() {
    const { fileList } = this.props;
    const props = {
      action: '//jsonplaceholder.typicode.com/posts/',
      multiple: true,
      // listType: 'picture',
      beforeUpload: (file) => {
        if (file.size > 1024 * 1024 * 30) {
          Choerodon.prompt('文件不能超过30M');
          return false;
        } else if (fileList.length >= 10) {
          Choerodon.prompt('最多上传10个文件');
          return false;
        } else {
          const tmp = file;
          tmp.status = 'done';
          if (this.props.onBeforeUpload) {
            if (fileList.length > 0) {
              this.props.onBeforeUpload(fileList.slice().concat(file));
            } else {
              this.props.onBeforeUpload([file]);
            }
          }
        }
        return false;
      },
      onRemove: (file) => {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        if (file.url && this.props.onRemove) {
          deleteFile(file.uid)
            .then((response) => {
              if (response) {
                newFileList.splice(index, 1);
                this.props.onRemove(newFileList);
                Choerodon.prompt('删除成功');
              }
            })
            .catch((error) => {
              if (error.response) {
                Choerodon.prompt(error.response.data.message);
              } else {
                Choerodon.prompt(error.message);
              }
            });
        } else {
          newFileList.splice(index, 1);
          this.props.onRemove(newFileList);
        }
      },
      // onPreview: (file) => {
      //   this.props.onPreview(file);
      // },
    };
    return (
      <Upload {...props} fileList={fileList} className="upload-button">
        <Button funcType={this.props.funcType || 'primary'}>
          <Icon type="file_upload" /> 上传附件
        </Button>
      </Upload>
    );
  }
}

export default UploadButton;
