import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageDrop from './ImageDrop';
import './WYSIWYGEditor.scss';
import cls from '../CommonComponent/ClickOutSide';
import { Button } from 'choerodon-ui';

Quill.register('modules/imageDrop', ImageDrop);

class WYSIWYGEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      msgSaving: null,
      delta: null,
      chatError: null,
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image'],
      // ['clean'],
    ],
    imageDrop: true,
  };

  formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'image',
  ];

  defaultStyle = {
    width: 498,
    height: 200,
    borderRight: 'none',
  };

  isHasImg = (delta) => {
    let pass = false;
    if (delta && delta.ops) {
      delta.ops.forEach((item) => {
        if (item.insert && item.insert.image) {
          pass = true;
        }
      });
    }
    return pass;
  };

  handleChange = (content, delta, source, editor) => {
    const value = editor.getContents();
    if (this.props.onChange && value && value.ops) {
      this.props.onChange(value.ops);
    }
  };

  empty = () => {
    this.props.onChange(undefined);
  }

  handleClickOutside = evt => {
    const { handleClickOutSide } = this.props;
    if (handleClickOutSide) {
      handleClickOutSide();
    }
  };

  render() {
    const { placeholder, value } = this.props;
    const style = { ...this.defaultStyle, ...this.props.style };
    const editHeight = style.height - (this.props.toolbarHeight || 42);
    return (
      <div style={{ width: '100%' }}>
        <div style={style} className="react-quill-editor">
          <ReactQuill
            theme="snow"
            modules={this.modules}
            formats={this.formats}
            style={{ height: editHeight }}
            placeholder={placeholder || '描述'}
            defaultValue={value}
            onChange={this.handleChange}
          />
        </div>
        {
          this.props.bottomBar && (
            <div className="CancelSaveBtn" style={{ padding: '0 8px', border: '1px solid #ccc', borderTop: 'none', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="primary"
                onClick={() => {
                  this.empty();
                  this.props.handleDelete();
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                loading={this.state.loading}
                onClick={() => {
                  this.setState({ loading: true });
                  this.props.handleSave();
                }}
              >
                保存
              </Button>
            </div>
          )
        }
      </div>
    );
  }
}

export default cls(WYSIWYGEditor);
